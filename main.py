# #uvicorn main:app --reload
# from fastapi import FastAPI, Request, Form
# from fastapi.templating import Jinja2Templates

# app = FastAPI()
# templates = Jinja2Templates(directory="/code")

# @app.get("/")
# def form_post(request: Request):
#     return templates.TemplateResponse('form.html', context={'request': request})


import requests

# Define your API endpoint and headers
api_url = "https://www.myperfectresume.com/build-resume/final-resume"  # Replace with the actual URL
headers = {
    "Authorization": "JTPYx78DRHM43BOH9vtw7KUeXAie67KbSxlGguVUk39EhvJZdFZ9zK1S_nh2RAtAeOkqsywzgm05OBhceR3y7yrRoZnMQGKcJQcNNlHynAVfyUahW_XE8pvHuX0JAm6c114-A3VoEVHi2jhOZF61VM0rTCV0No8nNrMjcMehYARePfi_pu73rr2UAEPgJ_8KRU6NfULqWMSMdnrb1D5fsWLJHC-0vjeplAUHQuSq3q79cCCE1mSddJMsxQYd23LIqu8VAm88G_x2A1NgZTBe4S4zNe9iREiXtG9mSsxRjQCJe1OjCeSOYkvtrq7K78oB9E9E4md8aj8CgQBJJqzjU9WpvuJxe9JnjobXQj5W6MKsCxPMsi0cn5dkNcAvlSspkagnzyEgvTNtwEUJz-ybBJlAtPFIc5ZieCGNBbG-JzdVGOP_9N_D521f6GO6M14ueqDGK7ALNi0DdKQrdKdvLBQEoOVh54AkjKj-E-5qQRZIwdsnEgS9_EYYHndx--lZgzhw8QMbpMjzsWUf5JqUqsf9_Ota3EjYppk1huWP8B-0Bo3z8-QKpWtMSwQrK6yEeLU_8dIIxm-Y3d2JF3zzMBh18JM0lXAc_A0kBW8c6Ncyzv-alspOORX3oy-a0Zyco7350xkaZD6tPg9wH_TT81gPawAja7ILQhtt3puEc6kWb_MA6jqehj52HiQBKhoxNgukLtcGHRFXju6vx5G20k1tO23JFDxu-TMBNEX_V5e9KAiuwpyUrMymimXQE7zFiDfWiui4b18Q9NpIgMfyJEX3bt079Lxy3qel2qwEqBIzi_aj7Pd2_pDXoR5gebGSQyLZ1NBTLhI94itZxoWCBPTd6BdQnS8z3_vuO09oVnkPJG6CPtPylexZJ3VaQOnNjlCkMMRz976WGz4TsOZzou0NCatHPj9_tY9AD8HJFOhKUs18TYNkqRN8-JXYmAdkWQ8ryQcguYRe841B_0AV1MiUXpjml2wzyXa1931SiyvpPXiLc5c_glRLasMSyauWnOEI2wzqcpdV7xE5GqGsQ6JXk59y91JAnq9EnQG4ADVP0H-MCroRdN_o-FvfdsO2UUP5UJVax1IdjDCtnIy93RQ-lQpyOHDxIeHsI4pay8kKSkh72Ql7a4XP4qCznnzv3OjXdFSPVs1GUPfCJf08kg",  # Replace with your actual token
    "Content-Type": "application/json"  # Adjust based on the API requirements
}

# Make the API call
response = requests.get(api_url, headers=headers)

# Check if the request was successful
if response.status_code == 200:
    # Save the resume to a file
    with open("resume.pdf", "wb") as file:  # Change the filename as needed
        file.write(response.content)
    print("Resume downloaded successfully!")
else:
    print(f"Failed to download resume. Status code: {response.status_code}")
