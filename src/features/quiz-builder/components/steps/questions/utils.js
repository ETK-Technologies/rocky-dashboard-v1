export const normalizeOption = (option) => {
    if (typeof option === "string") {
        return {
            text: option,
            image: "",
            imageType: "upload",
            hasImage: false,
        };
    }

    return {
        text: option.text || "",
        image: option.image || "",
        imageType: option.imageType || "upload",
        hasImage: option.hasImage || false,
    };
};

export const getOptionText = (option) => {
    return typeof option === "string" ? option : option?.text || "";
};
