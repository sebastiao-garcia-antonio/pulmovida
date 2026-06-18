from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(title="Saúde Inteligente - IA API")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Variáveis globais para os modelos
model = None
colunas = None

print("A carregar modelos na memoria...")
try:
    colunas = joblib.load(os.path.join(BASE_DIR, "colunas_modelo.pkl"))
    model = joblib.load(os.path.join(BASE_DIR, "modelo_diagnostico_v1.pkl"))
    print("Modelos de Inteligencia Artificial carregados com sucesso!")
except Exception as e:
    print(f"Erro ao carregar o modelo ou colunas: {e}")

class DadosPaciente(BaseModel):
    respostas: list[float]

class DiagnosticoResponse(BaseModel):
    diagnostico: str
    probabilidade: float
    classe: int

@app.get("/")
def read_root():
    return {
        "status": "IA API está a correr!",
        "modelos_carregados": model is not None,
        "n_colunas_esperadas": len(colunas) if colunas else 0
    }

@app.post("/prever", response_model=DiagnosticoResponse)
def prever_diagnostico(dados: DadosPaciente):
    if model is None:
        raise HTTPException(status_code=500, detail="Modelo de IA não carregado.")
        
    try:
        # 1. Transformar as respostas num array numpy (1, n_features)
        features = np.array([dados.respostas])
        
        # 2. Validação básica com base nas colunas do modelo treinado
        if colunas is not None and len(dados.respostas) != len(colunas):
            raise HTTPException(
                status_code=400, 
                detail=f"Recebidas {len(dados.respostas)} features, mas o modelo espera {len(colunas)}."
            )

        # 3. Fazer a previsão
        prediction = int(model.predict(features)[0])
        
        # 4. Obter a probabilidade
        try:
            probabilities = model.predict_proba(features)[0]
            prob_risco = float(probabilities[prediction])
        except AttributeError:
            prob_risco = 1.0

        # Mapear o risco matemático para uma etiqueta compreensível (Baseado nas 4 classes)
        if prediction == 3:
            diag_texto = "Risco Crítico / Doença Obstrutiva Crónica (DPOC, Asma Grave)"
        elif prediction == 2:
            diag_texto = "Risco Alto / Condição Crónica Profunda (Ex: Fibrose, Tuberculose)"
        elif prediction == 1:
            diag_texto = "Risco Moderado / Infecção Aguda (Gripe, Bronquite Aguda)"
        else:
            diag_texto = "Risco Baixo / Casos Saudáveis (Sintomas Leves ou Inexistentes)"

        return {
            "diagnostico": diag_texto,
            "probabilidade": prob_risco,
            "classe": prediction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno ao prever: {str(e)}")
