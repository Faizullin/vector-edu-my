import json

from django.contrib.auth import get_user_model
from django.utils.termcolors import background

from lms.apps.posts.models import Post
from lms.apps.report.lesson_page_element_component_use import collect

UserModel = get_user_model()
def start_recording(record_name: str, user_id: int):
    user = UserModel.objects.get(id=user_id)
    if record_name == "lesson_page_element_component_use":
        print(f"[record {record_name}] start recording")
        context = {
            "name": record_name,
            "data": collect(),
        }
        post_obj = Post.objects.create(
            title=f"Record for {record_name}",
            content=json.dumps(context),
            post_type = "record",
            author = user,
        )
        post_obj.title = f"Record for {record_name} [{post_obj.id}]"
        post_obj.save()
        print(f"[record {record_name}] end recording")
    


