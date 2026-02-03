from flask import Flask, request, jsonify
# flask -> python 서버 프레임워크, request -> 요청 데이터, jsonify -> JSON 응답 
from flask_cors import CORS
#cors -> 자바/프론트에서 호출 가능하게 허용
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import torch

app = Flask(__name__)
CORS(app)

# =========================
# 모델 로드 (서버 시작 시 1번)
# =========================
processor = ViTImageProcessor.from_pretrained("facebook/deit-tiny-patch16-224")
model = ViTForImageClassification.from_pretrained("facebook/deit-tiny-patch16-224")


model.eval()

# =========================
# 카테고리 매핑 테이블
# =========================
CATEGORY_MAP = {
    "가구": [
        "chair", "armchair", "rocking chair",
        "sofa", "couch",
        "table", "desk", "coffee table",
        "bed", "wardrobe", "cabinet", "bookshelf",
        "dresser", "nightstand"
    ],

    "가전제품": [
        "refrigerator", "fridge",
        "microwave", "oven",
        "washing machine", "washer",
        "dishwasher",
        "air conditioner", "ac",
        "heater", "radiator",
        "vacuum", "vacuum cleaner",
        "fan"
    ],

    "전자기기": [
        "laptop", "notebook", "computer", "desktop",
        "monitor", "screen",
        "keyboard", "mouse",
        "phone", "smartphone", "mobile phone",
        "tablet",
        "camera", "digital camera",
        "headphone", "earphone", "earbuds"
    ],

    "주방용품": [
        "pan", "frying pan", "skillet",
        "pot", "cooking pot",
        "knife", "kitchen knife",
        "cutting board",
        "kettle", "teapot",
        "rice cooker",
        "spoon", "fork", "plate", "bowl"
    ],

    "의류/잡화": [
        "shirt", "t-shirt", "tee",
        "jeans", "denim",
        "pants", "trousers",
        "jacket", "coat",
        "dress",
        "shoe", "sneaker", "boot",
        "bag", "handbag", "backpack",
        "hat", "cap", "wallet",
        "purse"
    ],

    "반려동물용품": [
        "dog", "puppy",
        "cat", "kitten",
        "pet",
        "dog bed", "cat bed",
        "leash", "collar",
        "dog toy", "pet toy"
    ],

    "스포츠/레저": [
        "bicycle", "bike", "mountain bike",
        "road bike",
        "wheel", "bicycle wheel",
        "helmet",
        "soccer ball", "football",
        "basketball",
        "tennis racket",
        "golf club",
        "skateboard",
        "surfboard"
    ],

    "취미/게임/음반": [
        "guitar", "electric guitar", "acoustic guitar",
        "piano", "keyboard",
        "drum",
        "gamepad", "joystick",
        "video game console",
        "record", "vinyl", "cd"
    ],

    "식품": [
        "apple", "banana", "orange",
        "bread", "pizza", "hamburger",
        "cake", "chocolate",
        "bottle", "wine bottle",
        "beer bottle"
    ],

    "생활용품": [
        "toothbrush", "toothpaste",
        "soap", "shampoo",
        "towel", "tissue",
        "cleaning spray",
        "mop", "broom"
    ],

    "뷰티/미용": [
        "cosmetic", "lipstick",
        "perfume", "lotion",
        "cream", "makeup",
        "nail polish"
    ],

    "중고차": [
        "car", "sedan", "suv", "jeep",
        "truck", "pickup",
        "sports car",
        "convertible"
    ]
}



# =========================
# 유틸 함수들
# =========================
def map_label_to_category(label):
    label = label.lower()
    for category, keywords in CATEGORY_MAP.items():
        for keyword in keywords:
            if keyword in label:
                return category
    return "기타"

def get_confidence(logits):
    probs = torch.softmax(logits, dim=1)
    return probs.max().item()

# =========================
# API
# =========================
@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    if "image" not in request.files:
        #request.files -> formData로 전송된 파일들
        return jsonify({"error": "image file required"}), 400

    image = Image.open(request.files["image"]).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    idx = logits.argmax(-1).item()
    raw_label = model.config.id2label[idx]
    print("🔥 RAW LABEL:", raw_label)   # ← 이거 추가!
    confidence = get_confidence(logits)
    print("confidenc: ", confidence)

    if confidence < 0.05:
        final_category = "기타"
    else:   
        final_category = map_label_to_category(raw_label)

    return jsonify({
        "category": final_category,   # 서비스용
        "confidence": confidence,
        "rawLabel": raw_label         # 디버깅용 (선택)
    })

# =========================
# 서버 실행
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
