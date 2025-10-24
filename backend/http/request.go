package http

import (
	"encoding/json"
	"log"
	"net/http"

	"backend/k8s" // Verifique se o nome do pacote está correto
)

// listPodsHandler agora lê o namespace da URL
func listPodsHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Extrai o valor do placeholder "{namespace}" da URL
	namespace := r.PathValue("namespace")

	// 2. [IMPORTANTE] Validação: Verifica se o namespace não está vazio
	if namespace == "" {
		http.Error(w, "O namespace não pode estar vazio", http.StatusBadRequest)
		return
	}

	// 3. [IMPORTANTE] Trate o erro da sua função! Não ignore com _
	jsonAllPods, err := k8s.ListPods(namespace)
	if err != nil {
		// Loga o erro no servidor
		log.Printf("ERRO: Falha ao listar pods no namespace '%s': %v", namespace, err)
		// Envia uma resposta de erro genérica para o cliente
		http.Error(w, "Erro ao buscar dados do Kubernetes", http.StatusInternalServerError)
		return
	}

	// 4. [MELHORIA] Defina o Content-Type para que os clientes saibam que é JSON
	w.Header().Set("Content-Type", "application/json")

	// 5. Converte para JSON
	jsonResponse, err := json.Marshal(jsonAllPods)
	if err != nil {
		// Se a serialização falhar (raro, mas possível), avise o servidor.
		// Não use log.Fatal(), pois isso derruba o servidor!
		log.Printf("ERRO: Falha ao serializar JSON: %v", err)
		http.Error(w, "Erro ao formatar resposta", http.StatusInternalServerError)
		return
	}

	// 6. Envia a resposta
	w.Write(jsonResponse)
}

func Listen() {
	http.HandleFunc("GET /listAllPods/{namespace}", listPodsHandler)
}
