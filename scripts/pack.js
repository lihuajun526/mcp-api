#!/usr/bin/env node
'use strict';
/**
 * 打包脚本 —— 生成可离线部署的发布目录
 *
 *   node scripts/pack.js            # 生成 dist-mcp-api/
 *   npm run package                 # 同上
 *
 * 产出物 dist-mcp-api/ 内已包含生产依赖（node_modules），
 * 服务器上解压即可直接跑，无需再联网 npm install。
 *
 * CI 中由 .github/workflows/pack-and-deploy.yml 调用，随后 zip 上传。
 * 说明：本仓库未提交 package-lock.json（在 .gitignore 内），
 *       因此生产依赖统一用 npm install 安装。
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST_NAME = 'dist-mcp-api';
const DIST = path.join(ROOT, DIST_NAME);

/** 需要进入发布包的条目（顺序无关） */
const ITEMS = [
    'app',
    'scripts',
    'sql',
    'deploy',
    'package.json',
    'README.md'
];

/** 复制时跳过的文件/目录名 */
const SKIP_NAMES = new Set([
    '.DS_Store',
    '.env',
    '.git',
    '.gitignore',
    '.github',
    '.idea',
    '.vscode',
    '.workbuddy',
    '.analysis',
    'node_modules',
    'logs',
    DIST_NAME
]);

/** 运行期必须存在的生产依赖，缺任一即视为打包失败 */
const REQUIRED_MODULES = ['express', 'mysql2', 'ioredis', 'dotenv', 'axios', 'cheerio'];

/** 需要混淆的应用源码目录（相对发布目录） */
const OBFUSCATE_ITEMS = ['app'];

/**
 * javascript-obfuscator 配置
 *
 * 目标是让发布包里的应用代码不可读、不可直接抄袭，同时不破坏运行时行为：
 *  - renameGlobals=false：不动 module / require / exports 等模块级标识
 *  - selfDefending / debugProtection 关闭：避免反调试在线上引入额外风险
 *  - 字符串数组 + base64 + 控制流平坦化：核心混淆手段
 */
const OBFUSCATE_OPTIONS = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    selfDefending: false,
    debugProtection: false,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 12,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayThreshold: 0.75,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
    sourceMap: false,
    disableConsoleOutput: false,
    log: false
};

function log(msg) {
    console.log(`[pack] ${msg}`);
}

/** fs.cpSync 过滤器：返回 false 表示跳过该条目 */
function filter(srcPath) {
    const base = path.basename(srcPath);
    if (SKIP_NAMES.has(base)) return false;
    if (base.endsWith('.log')) return false;
    return true;
}

function copyItem(name) {
    const src = path.join(ROOT, name);
    const dest = path.join(DIST, name);
    if (!fs.existsSync(src)) {
        log(`  · ${name}（不存在，跳过）`);
        return false;
    }
    fs.cpSync(src, dest, { recursive: true, preserveTimestamps: true, filter });
    log(`  ✓ ${name}`);
    return true;
}

function gitInfo() {
    const run = args => {
        try {
            return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
        } catch {
            return '';
        }
    };
    return {
        commit: process.env.GITHUB_SHA || run(['rev-parse', '--short', 'HEAD']),
        branch: process.env.GITHUB_REF_NAME || run(['rev-parse', '--abbrev-ref', 'HEAD'])
    };
}

function dirSize(dir) {
    let total = 0;
    const walk = p => {
        for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
            const full = path.join(p, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.isFile()) total += fs.statSync(full).size;
        }
    };
    walk(dir);
    return total;
}

function installProdDeps() {
    log('安装生产依赖（npm install --omit=dev）...');
    execFileSync('npm', ['install', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'], {
        cwd: DIST,
        stdio: 'inherit',
        env: process.env
    });

    const missing = REQUIRED_MODULES.filter(m => !fs.existsSync(path.join(DIST, 'node_modules', m)));
    if (missing.length) {
        throw new Error(`生产依赖缺失：${missing.join(', ')}`);
    }
    log(`生产依赖就绪（${REQUIRED_MODULES.join(', ')}）`);
}

/** 递归收集目录下的 .js 文件 */
function collectJsFiles(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...collectJsFiles(full));
        else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full);
    }
    return out;
}

/** 对发布目录内的应用源码做混淆（原地覆写，仓库源码不受影响） */
function obfuscateSource() {
    let Obfuscator;
    try {
        // 仅作为构建期依赖（devDependencies），运行时不安装
        Obfuscator = require('javascript-obfuscator');
    } catch {
        throw new Error('缺少 javascript-obfuscator，请先执行 npm install（devDependencies）');
    }

    let count = 0;
    let before = 0;
    let after = 0;

    for (const item of OBFUSCATE_ITEMS) {
        const target = path.join(DIST, item);
        if (!fs.existsSync(target)) {
            log(`  · ${item}（不存在，跳过混淆）`);
            continue;
        }
        for (const file of collectJsFiles(target)) {
            const code = fs.readFileSync(file, 'utf8');
            const obfuscated = Obfuscator.obfuscate(code, OBFUSCATE_OPTIONS).getObfuscatedCode();
            before += Buffer.byteLength(code);
            after += Buffer.byteLength(obfuscated);
            fs.writeFileSync(file, obfuscated);
            count++;
        }
        log(`  混淆 ${item}/（${count} 个文件）`);
    }

    if (!count) throw new Error('未找到需要混淆的源码文件');
    const ratio = (after / before).toFixed(1);
    log(`应用代码已混淆（${count} 个文件，体积 ×${ratio}）`);
}

function writeBuildInfo() {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const git = gitInfo();
    const info = {
        name: pkg.name,
        version: pkg.version,
        build_time: new Date().toISOString(),
        commit: git.commit,
        branch: git.branch,
        node: process.version,
        obfuscated: true
    };
    fs.writeFileSync(path.join(DIST, 'BUILD_INFO.json'), `${JSON.stringify(info, null, 2)}\n`);
    log(`BUILD_INFO.json → version=${info.version} commit=${info.commit || 'n/a'} branch=${info.branch || 'n/a'}`);
    return info;
}

function main() {
    log(`清理 ${DIST_NAME}/`);
    fs.rmSync(DIST, { recursive: true, force: true });
    fs.mkdirSync(DIST, { recursive: true });

    log('复制应用文件：');
    for (const item of ITEMS) copyItem(item);

    installProdDeps();
    log('混淆应用源码：');
    obfuscateSource();
    const info = writeBuildInfo();

    const sizeMb = (dirSize(DIST) / 1024 / 1024).toFixed(2);
    log(`打包完成 → ${DIST_NAME}/（${sizeMb} MB）`);
    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(
            process.env.GITHUB_OUTPUT,
            `version=${info.version}\ncommit=${info.commit}\ndist=${DIST_NAME}\n`
        );
    }
}

if (require.main === module) {
    try {
        main();
    } catch (err) {
        console.error(`[pack] 打包失败：${err.message}`);
        process.exit(1);
    }
}

module.exports = { main, DIST_NAME };
