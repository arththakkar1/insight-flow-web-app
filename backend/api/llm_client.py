import openai
import os

try:
    from .secrets import OPENROUTER_API_KEY
except ImportError:
    OPENROUTER_API_KEY = None

class OpenRouterClient:
    def __init__(self, base_url="https://openrouter.ai/api/v1", api_key=None):
        if not api_key:
            api_key = OPENROUTER_API_KEY or os.environ.get("OPENROUTER_API_KEY")
            
        if not api_key or api_key == "your-api-key-here":
            raise ValueError(
                "OpenRouter API key is missing. Please set OPENROUTER_API_KEY "
                "in backend/api/secrets.py or as an environment variable."
            )

        self.client = openai.OpenAI(
            base_url=base_url,
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "InsightFlow"
            }
        )

    def get_fallback_models(self, preferred_model):
        return [
            preferred_model,
            "openrouter/free",
            "google/gemma-4-31b-it:free",
            "poolside/laguna-m.1:free",
            "cohere/north-mini-code:free"
        ]

    def generate_chat_response(self, messages, model="cohere/north-mini-code:free"):
        models_to_try = self.get_fallback_models(model)
        
        for idx, current_model in enumerate(models_to_try):
            try:
                response = self.client.chat.completions.create(
                    model=current_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000
                )
                content = response.choices[0].message.content
                if content is None:
                    raise Exception("Model returned empty content")
                return content
            except Exception as e:
                # If it's the last model in the fallback list, raise the exception
                if idx == len(models_to_try) - 1:
                    raise e
                print(f"Model {current_model} failed with error: {e}. Trying next fallback...")

    def generate_dax_measure(self, dataset_info, target_metric, model="cohere/north-mini-code:free"):
        prompt = f"Given this dataset context: {dataset_info}, generate a Power BI DAX formula for: {target_metric}."
        messages = [
            {"role": "system", "content": "You are a senior data analyst and DAX expert."},
            {"role": "user", "content": prompt}
        ]
        return self.generate_chat_response(messages, model)

    def generate_report_config(self, dataset_info, model="cohere/north-mini-code:free"):
        prompt = (
            f"You are an expert BI Data Architect. Given the following dataset schema: {dataset_info}, "
            "design a dashboard with logical visualizations and DAX measures.\n"
            "Return EXACTLY AND ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "visuals_data": [\n'
            '    {"type": "BarChart" | "LineChart" | "PieChart", "title": "Chart Title", "description": "Brief axis/legend info"}\n'
            "  ],\n"
            '  "dax_data": [\n'
            '    {"name": "Measure Name", "formula": "Valid DAX Expression"}\n'
            "  ]\n"
            "}\n"
            "Ensure you provide a maximum of 6 logical visuals and a maximum of 5 DAX measures."
        )
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        models_to_try = self.get_fallback_models(model)
        for idx, current_model in enumerate(models_to_try):
            try:
                response = self.client.chat.completions.create(
                    model=current_model,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=1500,
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                if content is None:
                    raise Exception("Model returned empty content")
                return content
            except Exception as e:
                if idx == len(models_to_try) - 1:
                    raise e
                print(f"Model {current_model} failed with error: {e}. Trying next fallback...")

    def generate_dashboard_config(self, dataset_info, model="openrouter/free"):
        prompt = (
            f"You are an expert BI Data Architect. Given the following dataset schema: {dataset_info}, "
            "design a beautiful interactive dashboard.\n"
            "Return EXACTLY AND ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "layout": "executive-summary" | "spotify-grid" | "grid-2x2" | "split-horizontal",\n'
            '  "theme_style": "dark-enterprise" | "pastel-minimal" | "analytical" | "ocean",\n'
            '  "theme_font": "sans" | "mono" | "serif",\n'
            '  "custom_measures": [\n'
            '    {"name": "Measure Name", "formula": "Valid DAX Expression (e.g. SUM(Revenue) - SUM(Cost))"}\n'
            "  ],\n"
            '  "charts": [\n'
            '    {"id": "1", "type": "KPI" | "Bar" | "Line" | "Pie" | "Scatter" | "Area", "title": "Chart Title", "xAxis": "ColumnName", "yAxis": "ColumnName"}\n'
            "  ]\n"
            "}\n"
            "CRITICAL: You MUST ONLY use columns that explicitly exist in the provided dataset schema. Do NOT invent, hallucinate, or guess column names. Use exact casing.\n"
            "Ensure you provide exactly 7 chart configurations in the array (ids 1 to 7)."
        )
        messages = [
            {"role": "system", "content": "You are a senior BI Architect and data scientist. Output ONLY raw JSON, no markdown blocks."},
            {"role": "user", "content": prompt}
        ]
        
        models_to_try = self.get_fallback_models(model)
        for idx, current_model in enumerate(models_to_try):
            try:
                response = self.client.chat.completions.create(
                    model=current_model,
                    messages=messages,
                    temperature=0.4,
                    max_tokens=1500
                )
                content = response.choices[0].message.content
                if not content:
                    raise ValueError("Empty response from LLM")
                
                import json, re
                json_str = content
                json_match = re.search(r'```json\s*(\{.*?\})\s*```', json_str, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    json_match = re.search(r'(\{.*\})', json_str, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(1)
                
                # Verify it parses correctly
                json.loads(json_str)
                return json_str
            except Exception as e:
                if idx == len(models_to_try) - 1:
                    raise e
                print(f"Model {current_model} failed with error: {e}. Trying next fallback...")

    def generate_detailed_markdown_report(self, ml_summary, model="cohere/north-mini-code:free"):
        prompt = (
            "You are an expert Data Scientist and Machine Learning Engineer. "
            "I will provide you with the metadata, metrics, and feature importances "
            "of a machine learning model that was just trained.\n\n"
            "Your task is to write a highly detailed, comprehensive, descriptive "
            "Machine Learning Report (approximately 3 to 4 pages long when rendered) in Markdown format.\n\n"
            "Include the following sections:\n"
            "1. **Executive Summary**: High-level overview of the model, target, and outcome.\n"
            "2. **Data & Blueprint Profile**: Analysis of the dataset structure, features used, and data preprocessing steps.\n"
            "3. **Model Selection & Rationale**: Explanation of the chosen algorithm and its suitability for the task.\n"
            "4. **Performance Diagnostics**: In-depth analysis of the metrics (e.g., R², MSE, Accuracy) and what they mean in a business context.\n"
            "5. **Feature Importance Insights**: Deep dive into the top driving factors (key drivers) behind the predictions.\n"
            "6. **Conclusion & Recommendations**: Next steps, potential risks, and recommendations for model deployment.\n\n"
            "Make it professional, verbose, beautifully formatted with markdown headers, lists, and bold text. "
            "Do NOT include JSON, just pure Markdown.\n\n"
            f"Here is the ML Model Summary Data:\n{ml_summary}"
        )
        messages = [
            {"role": "system", "content": "You are a senior data scientist writing a comprehensive research report."},
            {"role": "user", "content": prompt}
        ]
        
        models_to_try = self.get_fallback_models(model)
        for idx, current_model in enumerate(models_to_try):
            try:
                response = self.client.chat.completions.create(
                    model=current_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=2500
                )
                content = response.choices[0].message.content
                if content is None:
                    raise Exception("Model returned empty content")
                return content
            except Exception as e:
                if idx == len(models_to_try) - 1:
                    raise e
                print(f"Model {current_model} failed with error: {e}. Trying next fallback...")

    def generate_detailed_bi_report(self, dataset_info, visuals_data, dax_data, model="cohere/north-mini-code:free"):
        prompt = (
            "You are an expert Data Analyst and Business Intelligence Architect. "
            "I will provide you with the metadata of a dataset, a list of visual charts generated for a dashboard, "
            "and a set of DAX measures created to analyze the data.\n\n"
            "Your task is to write a highly detailed, comprehensive, descriptive "
            "Business Intelligence (BI) Report (approximately 3 to 4 pages long when rendered) in Markdown format.\n\n"
            "Include the following sections:\n"
            "1. **Executive Summary**: High-level overview of the dataset and the primary goals of the dashboard.\n"
            "2. **Dataset Profile & Architecture**: Analysis of the dataset structure, data types, and potential data quality implications.\n"
            "3. **Visual Analytics Review**: Detailed walkthrough of each generated visualization (e.g. BarCharts, LineCharts) and what trends or insights they likely reveal.\n"
            "4. **DAX Measures Deep Dive**: In-depth explanation of the generated DAX measures and how they provide business value.\n"
            "5. **Strategic Recommendations**: Next steps, potential data enrichments, and recommendations for stakeholders.\n\n"
            "Make it professional, verbose, beautifully formatted with markdown headers, lists, and bold text. "
            "Do NOT include JSON, just pure Markdown.\n\n"
            f"Dataset Info:\n{dataset_info}\n\n"
            f"Visuals Generated:\n{visuals_data}\n\n"
            f"DAX Measures Generated:\n{dax_data}"
        )
        messages = [
            {"role": "system", "content": "You are a senior data analyst writing a comprehensive BI research report."},
            {"role": "user", "content": prompt}
        ]
        
        models_to_try = self.get_fallback_models(model)
        for idx, current_model in enumerate(models_to_try):
            try:
                response = self.client.chat.completions.create(
                    model=current_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=2500
                )
                content = response.choices[0].message.content
                if content is None:
                    raise Exception("Model returned empty content")
                return content
            except Exception as e:
                if idx == len(models_to_try) - 1:
                    raise e
                print(f"Model {current_model} failed with error: {e}. Trying next fallback...")