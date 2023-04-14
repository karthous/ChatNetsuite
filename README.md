![image](ChatNetsuite_logo.png)

# ChatNetsuite 0.0.3

A basic chatbot with user interface deployed in Netsuite, using OpenAI&#39;s API.  

![image](ChatNetsuite_ui.png)

[中文文档](README_sc.md)

## Table of Contents

- [Deployment](#deployment)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [Changelog](#changelog)

## Deployment

To use ChatNetsuite in NetSuite, you can follow these steps:

1. Upload **chatNetsuite.js** to SuiteScripts folder in the File Cabinet.
2. Go to **Customization > Scripts > New**.
3. Select **ChatNetsuite_public.js** and click on **Create Script Record**.
4. Set the name of the script and click on **Save**.
5. Click on **Deploy Script**.
6. Set script deployment configuration and click on **Save**.
7. Click on the url under the field **URL**.
8. Configure **OPENAI_KEY** and **SCRIPT_URL** in **ChatNetsuite_public.js** file.
9. Alternatively, click on **Edit** and configure **Links** to place ChatNetsuite on the navigation bar.
10. Enjoy.

You can refer to NetSuite's SuiteScript documentation for more detailed information.

## Maintainers

[@karthous](https://github.com/karthous)

## Contributing

PRs accepted.

## Disclaimer

This is not an official product of Oracle, Netsuite, or OpenAI. 
The authors of this project are not responsible for any content generated using this interface.
By using this software, you agree **not** to:

1. Violates any laws.
2. Produces any harm to a person or persons.
3. Disseminates (spreads) any personal information that would be meant for harm.
4. Spreads misinformation.
5. Target vulnerable groups.

## Changelog  

**V0.03 - 14th April 2023:**  
Support multi-round conversations and temporarily preserve chat history. Improve user interface.

**V0.02 - 13th April 2023:**  
Update the model from 'text-davinci-003' to 'gpt-3.5-turbo'.