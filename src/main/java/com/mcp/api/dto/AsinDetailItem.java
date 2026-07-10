package com.mcp.api.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class AsinDetailItem {

    private String asin;
    private String asinUrl;
    private Long availableDate;
    private Badge badge;
    private String title;
    private String brand;
    private String brandUrl;
    private String bsrId;
    private String bsrLabel;
    private Integer bsrRank;
    private Long createdTime;
    private String dimensions;
    private Long firstRatingDate;
    private String imageUrl;
    private Integer lqs;
    private String nodeId;
    private String nodeIdPath;
    private String nodeLabelPath;
    private String nodeLabelPathLocale;
    private String parent;
    private Double price;
    private Integer questions;
    private Double rating;
    private Integer ratings;
    private Integer reviews;
    private Integer variantRatings;
    private Integer variantReviews;
    private String sellerId;
    private String sellerName;
    private String fulfillment;
    private Integer sellers;
    private List<String> skuList;
    private String marketplace;
    private List<String> features;
    private String overviews;
    private Long updatedTime;
    private List<VariationItem> variationList;
    private Integer variations;
    private String weight;
    private String zoomImageUrl;
    private SubcategoryInfo subcategories;
    private Double deliveryPrice;
    private Double primePrice;
    private String coupon;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class Badge {
        private String bestSeller;
        private String amazonChoice;
        private String newRelease;
        private String ebc;
        private String video;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class SubcategoryInfo {
        private Integer rank;
        private String code;
        private String label;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class VariationItem {
        private String asin;
        private String attribute;
    }
}
