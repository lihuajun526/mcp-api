package com.mcp.api.transformer;

import com.fasterxml.jackson.databind.JsonNode;
import com.mcp.api.dto.AsinDetailItem;
import com.mcp.api.dto.AsinDetailResponse;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AsinTransformer {

    public AsinDetailResponse transform(JsonNode root) {
        JsonNode data = root.path("data");
        JsonNode items = data.path("items");

        List<AsinDetailItem> transformed = new ArrayList<>();
        if (items.isArray()) {
            for (JsonNode item : items) {
                transformed.add(AsinDetailItem.builder()
                        .asin(text(item, "asin"))
                        .asinUrl(text(item, "asinUrl", "asin_url"))
                        .availableDate(longValue(item, "availableDate", "available_date", "availableTime"))
                        .badge(buildBadge(item.path("badge"), item))
                        .brand(text(item, "brand"))
                        .brandUrl(text(item, "brandUrl", "brand_url"))
                        .bsrId(text(item, "bsrId", "bsr_id"))
                        .bsrLabel(text(item, "bsrLabel", "bsr_label"))
                        .bsrRank(intValue(item, "bsrRank", "bsr_rank"))
                        .createdTime(longValue(item, "createdTime", "created_time"))
                        .dimensions(text(item, "dimensions", "dimension"))
                        .firstRatingDate(longValue(item, "firstRatingDate", "first_rating_date"))
                        .imageUrl(text(item, "imageUrl", "image_url"))
                        .lqs(intValue(item, "lqs"))
                        .nodeId(text(item, "nodeId", "node_id"))
                        .nodeIdPath(text(item, "nodeIdPath", "node_id_path"))
                        .nodeLabelPath(text(item, "nodeLabelPath", "node_label_path"))
                        .nodeLabelPathLocale(text(item, "nodeLabelPathLocale", "node_label_path_locale"))
                        .parent(text(item, "parent"))
                        .price(doubleValue(item, "price"))
                        .questions(intValue(item, "questions"))
                        .rating(doubleValue(item, "rating"))
                        .ratings(intValue(item, "ratings"))
                        .reviews(intValue(item, "reviews"))
                        .variantRatings(intValue(item, "variantRatings", "variant_ratings"))
                        .variantReviews(intValue(item, "variantReviews", "variant_reviews"))
                        .sellerId(text(item, "sellerId", "seller_id"))
                        .sellerName(text(item, "sellerName", "seller_name"))
                        .fulfillment(text(item, "fulfillment"))
                        .sellers(intValue(item, "sellers"))
                        .skuList(stringList(item, "skuList", "sku_list"))
                        .marketplace(text(item, "marketplace", "market"))
                        .build());

                AsinDetailItem current = transformed.get(transformed.size() - 1);
                current.setTitle(text(item, "title"));
                current.setFeatures(stringList(item, "features"));
                current.setOverviews(overviews(item, "overviews", "overview"));
                current.setUpdatedTime(longValue(item, "updatedTime", "updated_time"));
                current.setVariationList(variationList(item, "variationList", "variation_list"));
                current.setVariations(intValue(item, "variations"));
                current.setWeight(text(item, "weight"));
                current.setZoomImageUrl(text(item, "zoomImageUrl", "zoom_image_url"));
                current.setSubcategories(subcategories(item.path("subcategories"), item));
                current.setDeliveryPrice(doubleValue(item, "deliveryPrice", "delivery_price"));
                current.setPrimePrice(doubleValue(item, "primePrice", "prime_price"));
                current.setCoupon(text(item, "coupon"));
            }
        }

        return AsinDetailResponse.builder()
                .page(data.path("page").asInt())
                .size(data.path("size").asInt())
                .total(data.path("total").asInt())
                .items(transformed)
                .build();
    }

    private AsinDetailItem.Badge buildBadge(JsonNode badgeNode, JsonNode item) {
        JsonNode node = badgeNode != null && !badgeNode.isMissingNode() && !badgeNode.isNull()
                ? badgeNode
                : item;
        return AsinDetailItem.Badge.builder()
                .bestSeller(flag(node, "bestSeller", "best_seller"))
                .amazonChoice(flag(node, "amazonChoice", "amazon_choice"))
                .newRelease(flag(node, "newRelease", "new_release"))
                .ebc(flag(node, "ebc"))
                .video(flag(node, "video"))
                .build();
    }

    private AsinDetailItem.SubcategoryInfo subcategories(JsonNode subNode, JsonNode item) {
        JsonNode node = subNode != null && !subNode.isMissingNode() && !subNode.isNull()
                ? subNode
                : item.path("subCategory");
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        return AsinDetailItem.SubcategoryInfo.builder()
                .rank(intValue(node, "rank"))
                .code(text(node, "code"))
                .label(text(node, "label"))
                .build();
    }

    private List<AsinDetailItem.VariationItem> variationList(JsonNode item, String... keys) {
        JsonNode array = firstNode(item, keys);
        if (array == null || !array.isArray()) {
            return Collections.emptyList();
        }
        List<AsinDetailItem.VariationItem> list = new ArrayList<>();
        for (JsonNode v : array) {
            list.add(AsinDetailItem.VariationItem.builder()
                    .asin(text(v, "asin"))
                    .attribute(text(v, "attribute", "attr"))
                    .build());
        }
        return list;
    }

    private List<String> stringList(JsonNode item, String... keys) {
        JsonNode node = firstNode(item, keys);
        if (node == null || node.isMissingNode() || node.isNull()) {
            return Collections.emptyList();
        }
        if (node.isArray()) {
            List<String> values = new ArrayList<>();
            for (JsonNode n : node) {
                values.add(n.asText(""));
            }
            return values;
        }
        String text = node.asText("");
        if (text.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Collections.singletonList(text);
    }

    private String overviews(JsonNode item, String... keys) {
        JsonNode node = firstNode(item, keys);
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        if (node.isObject() || node.isArray()) {
            return node.toString();
        }
        return node.asText(null);
    }

    private String text(JsonNode item, String... keys) {
        JsonNode node = firstNode(item, keys);
        return node == null || node.isNull() || node.isMissingNode() ? null : node.asText(null);
    }

    private Integer intValue(JsonNode item, String... keys) {
        JsonNode node = firstNode(item, keys);
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        if (node.isNumber()) {
            return node.intValue();
        }
        String text = node.asText("").trim();
        if (text.isEmpty()) {
            return null;
        }
        try {
            return Integer.valueOf(text);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Long longValue(JsonNode item, String... keys) {
        JsonNode node = firstNode(item, keys);
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        if (node.isNumber()) {
            return node.longValue();
        }
        String text = node.asText("").trim();
        if (text.isEmpty()) {
            return null;
        }
        try {
            return Long.valueOf(text);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Double doubleValue(JsonNode item, String... keys) {
        JsonNode node = firstNode(item, keys);
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        if (node.isNumber()) {
            return node.doubleValue();
        }
        String text = node.asText("").trim();
        if (text.isEmpty()) {
            return null;
        }
        try {
            return Double.valueOf(text);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String flag(JsonNode item, String... keys) {
        JsonNode node = firstNode(item, keys);
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        if (node.isBoolean()) {
            return node.booleanValue() ? "Y" : "N";
        }
        String text = node.asText("").trim();
        if (text.isEmpty()) {
            return null;
        }
        if ("1".equals(text) || "true".equalsIgnoreCase(text) || "Y".equalsIgnoreCase(text)) {
            return "Y";
        }
        if ("0".equals(text) || "false".equalsIgnoreCase(text) || "N".equalsIgnoreCase(text)) {
            return "N";
        }
        return text;
    }

    private JsonNode firstNode(JsonNode item, String... keys) {
        if (item == null || item.isMissingNode() || item.isNull()) {
            return null;
        }
        for (String key : keys) {
            JsonNode node = item.path(key);
            if (!node.isMissingNode() && !node.isNull()) {
                return node;
            }
        }
        return null;
    }
}
