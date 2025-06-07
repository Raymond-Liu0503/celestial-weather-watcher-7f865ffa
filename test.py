# The model can perform 14 different vision language model and computer vision tasks. The input ```content``` field should be formatted as ```"<TASK_PROMPT><text_prompt (only when needed)><img>"```.
# Users need to specify the task type at the beginning. Image supports both base64 and NvCF asset id. Some tasks require a text prompt, and users need to provide that after image. Below are the examples for each task.
# For <CAPTION_TO_PHRASE_GROUNDING>, <REFERRING_EXPRESSION_SEGMENTATION>, <OPEN_VOCABULARY_DETECTION>, users can change the text prompt as other descriptions.
# For <REGION_TO_SEGMENTATION>, <REGION_TO_CATEGORY>, <REGION_TO_DESCRIPTION>, the text prompt is formatted as <loc_x1><loc_y1><loc_x2><loc_y2>, which is the normalized coordinates from region of interest bbox. x1=int(top_left_x_coor/width*999), y1=int(top_left_y_coor/height*999), x2=int(bottom_right_x_coor/width*999), y2=int(bottom_right_y_coor/height*999).
import os
import sys
import zipfile
import requests

nvai_url = "https://ai.api.nvidia.com/v1/vlm/microsoft/florence-2"
header_auth = f'Bearer {os.getenv("API_KEY_REQUIRED_IF_EXECUTING_OUTSIDE_NGC", "")}'
prompts = ["<CAPTION>",
    "<DETAILED_CAPTION>",
    "<MORE_DETAILED_CAPTION>",
    "<OD>",
    "<DENSE_REGION_CAPTION>",
    "<REGION_PROPOSAL>",
    "<CAPTION_TO_PHRASE_GROUNDING>A black and brown dog is laying on a grass field.",
    "<REFERRING_EXPRESSION_SEGMENTATION>a black and brown dog",
    "<REGION_TO_SEGMENTATION><loc_312><loc_168><loc_998><loc_846>",
    "<OPEN_VOCABULARY_DETECTION>a black and brown dog",
    "<REGION_TO_CATEGORY><loc_312><loc_168><loc_998><loc_846>",
    "<REGION_TO_DESCRIPTION><loc_312><loc_168><loc_998><loc_846>",
    "<OCR>",
    "<OCR_WITH_REGION>"]


def _upload_asset(input, description):
    """
    Uploads an asset to the NVCF API.
    :param input: The binary asset to upload
    :param description: A description of the asset

    """

    authorize = requests.post(
        "https://api.nvcf.nvidia.com/v2/nvcf/assets",
        headers={
            "Authorization": header_auth,
            "Content-Type": "application/json",
            "accept": "application/json",
        },
        json={"contentType": "image/jpeg", "description": description},
        timeout=30,
    )
    authorize.raise_for_status()

    response = requests.put(
        authorize.json()["uploadUrl"],
        data=input,
        headers={
            "x-amz-meta-nvcf-asset-description": description,
            "content-type": "image/jpeg",
        },
        timeout=300,
    )

    response.raise_for_status()
    return str(authorize.json()["assetId"])

def _generate_content(task_id, asset_id):
    if task_id < 0 or task_id >= len(prompts):
        print(f"task_id should within [0, {len(prompts)-1}]")
        exit(1)
    prompt = prompts[task_id]
    content = f'{prompt}<img src="data:image/jpeg;asset_id,{asset_id}" />'
    return content

if __name__ == "__main__":
    """Uploads two images of your choosing to the NVCF API and sends a request
    to the Visual ChangeNet model to compare them. The response is saved to
    <output_dir>
    """

    if len(sys.argv) != 4:
        print("Usage: python test.py <test_image> <result_dir> <task_id>\n"
            "For example: python test.py car.jpg result_dir 0")
        sys.exit(1)

    if len(os.getenv("API_KEY_REQUIRED_IF_EXECUTING_OUTSIDE_NGC", "")) == 0:
        print("API_KEY not set. Please export API_KEY_REQUIRED_IF_EXECUTING_OUTSIDE_NGC=<Your API Key> as environment variable.")
        sys.exit(1)

    # Local images
    asset_id = _upload_asset(open(sys.argv[1], "rb"), "Test Image")
    content = _generate_content(int(sys.argv[3]), asset_id)
    # Asset IDs returned by the _upload_asset function
    inputs = {
        "messages": [{
            "role": "user",
            "content": content
        }]
    }
    # asset_list = f"{asset_id}"
    headers = {
        "Content-Type": "application/json",
        "NVCF-INPUT-ASSET-REFERENCES": asset_id,
        "NVCF-FUNCTION-ASSET-IDS": asset_id,
        "Authorization": header_auth,
        "Accept": "application/json"
    }

    print(asset_id, inputs)

    # Send the request to the NIM API.
    response = requests.post(nvai_url, headers=headers, json=inputs)

    with open(f"{sys.argv[2]}.zip", "wb") as out:
        out.write(response.content)

    with zipfile.ZipFile(f"{sys.argv[2]}.zip", "r") as z:
        z.extractall(sys.argv[2])

    print(f"Response saved to path: {sys.argv[2]}. File list: {os.listdir(sys.argv[2])}")
