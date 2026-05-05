package com.financesystem.entity;

public enum ExpenseCategory {
    FOOD("飲食", "fa-utensils"),
    TRANSPORT("交通", "fa-car"),
    ENTERTAINMENT("娛樂", "fa-film"),
    SHOPPING("購物", "fa-shopping-bag"),
    UTILITIES("水電費", "fa-lightbulb"),
    HEALTHCARE("醫療", "fa-hospital"),
    EDUCATION("教育", "fa-book"),
    INSURANCE("保險", "fa-shield-alt"),
    RENT("房租", "fa-home"),
    SALARY("薪資", "fa-money-bill"),
    INVESTMENT("投資", "fa-chart-line"),
    OTHER("其他", "fa-tag");

    private final String displayName;
    private final String icon;

    ExpenseCategory(String displayName, String icon) {
        this.displayName = displayName;
        this.icon = icon;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getIcon() {
        return icon;
    }
}
