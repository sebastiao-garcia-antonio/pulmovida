from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(title="Saúde Inteligente - IA API")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Variáveis globais para os modelos
scaler = None
model = None
colunas = None

print("A carregar modelos na memoria... (Isto pode demorar uns segundos devido ao tamanho)")
try:
    colunas = joblib.load(os.path.join(BASE_DIR, "colunas_modelo.pkl"))
    model = joblib.load(os.path.join(BASE_DIR, "modelo_diagnostico_v1.joblib"))
    print("Modelos de Inteligencia Artificial carregados com sucesso!")
except Exception as e:
    print(f"Erro ao carregar o modelo ou colunas: {e}")

# O novo modelo Random Forest não requer scaler.
scaler = None

class DadosPaciente(BaseModel):
    respostas: list[float]

class DiagnosticoResponse(BaseModel):
    diagnostico: str
    probabilidade: float

@app.get("/")
def read_root():
    return {
        "status": "IA API está a correr!",
        "modelos_carregados": model is not None
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

        # 3. Fazer a previsão diretamente com as features (Random Forest não precisa de scaling)
        prediction = model.predict(features)
        
        # 4. Obter a probabilidade (chance matemática de ter a doença/risco)
        try:
            probabilities = model.predict_proba(features)
            prob_risco = float(probabilities[0][1]) # Assume classe '1' como risco positivo
        except AttributeError:
            # Caso o modelo não suporte probabilidades nativamente (ex: alguns SVM lineares)
            prob_risco = 1.0 if float(prediction[0]) > 0 else 0.0

        # Mapear o risco matemático para uma etiqueta compreensível
        if prob_risco > 0.75:
            diag_texto = "Risco Crítico / Suspeita de Doença Respiratória Grave"
        elif prob_risco > 0.45:
            diag_texto = "Risco Moderado / Sintomas Respiratórios"
        else:
            diag_texto = "Risco Baixo / Sintomas Leves"

        return {
            "diagnostico": diag_texto,
            "probabilidade": prob_risco
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno ao prever: {str(e)}")
