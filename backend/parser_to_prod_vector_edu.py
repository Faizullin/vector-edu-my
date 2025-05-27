import shutil
import os
import re

# Use absolute paths here
source_project = os.path.abspath(".")
destination_project = os.path.abspath("../../vector-education/backend")

folders_to_replace = ["lms", "static"]

# Step 1: Delete old folders in destination
for folder in folders_to_replace:
    dest_folder_path = os.path.join(destination_project, folder)
    if os.path.exists(dest_folder_path):
        shutil.rmtree(dest_folder_path)
        print(f"Deleted: {dest_folder_path}")

# Step 2: Copy new folders from source
for folder in folders_to_replace:
    src_folder_path = os.path.join(source_project, folder)
    dest_folder_path = os.path.join(destination_project, folder)
    shutil.copytree(src_folder_path, dest_folder_path)
    print(f"Copied: {src_folder_path} -> {dest_folder_path}")

# Step 3: Modify index.html with regex
index_html_path = os.path.join(destination_project, "lms", "templates", "lms", "index.html")

if os.path.exists(index_html_path):
    with open(index_html_path, "r", encoding="utf-8") as file:
        content = file.read()

    updated_content = re.sub(
        r'<script>\s*window\.VITE_APP_API_URL\s*=\s*null;\s*</script>',
        '<script>window.VITE_APP_API_URL = "https://backend.vector-educate.com";</script>',
        content
    )

    with open(index_html_path, "w", encoding="utf-8") as file:
        file.write(updated_content)

    print(f"✅ Updated API URL in: {index_html_path}")
else:
    print(f"❌ File not found: {index_html_path}")
