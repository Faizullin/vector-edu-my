from api_lessons.models import QuestionComponent, BlueCardComponent, AudioComponent, FillTextComponent, VideoComponent, \
    RecordAudioComponent, ImageComponent, PutInOrderComponent, TextComponent

COMPONENT_NAME_TO_ELEMENT_FIELD_NAME_DICT = {
    "matching": "matching_component",
    "audio": "audio_component",
    "question": "question_component",
    "blue-card": "blue_card_component",
    "fill-text": "fill_text_component",
    "video": "video_component",
    "record-audio": "record_audio_component",
    "put-in-order": "put_in_order_component",
    "image": "image_component",
    "text": "text_component",
}

COMPONENT_NAME_TO_COMPONENT_MODEL_CLASS_DICT = {
    "question": QuestionComponent,
    "blue-card": BlueCardComponent,
    "audio": AudioComponent,
    "fill-text": FillTextComponent,
    "video": VideoComponent,
    "record-audio": RecordAudioComponent,
    "put-in-order": PutInOrderComponent,
    "image": ImageComponent,
    "text": TextComponent,
}
