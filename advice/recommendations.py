def get_recommendations(disease):
    advice_dict = {
        "Rust": [
            "Apply sulfur-based fungicide.",
            "Improve airflow between plants.",
            "Avoid watering leaves late in the day."
        ],
        "Blight": [
            "Remove infected leaves.",
            "Apply copper-based fungicide.",
            "Rotate crops every season."
        ],
        "Leaf Spot": [
            "Use disease-free seeds.",
            "Apply appropriate fungicides.",
            "Control weeds that host pathogens."
        ],
        "Healthy": [
            "No disease detected. Keep monitoring regularly.",
            "Maintain good irrigation and fertilization.",
            "Inspect for pests weekly."
        ]
    }
    return advice_dict.get(disease, ["No advice found."])
