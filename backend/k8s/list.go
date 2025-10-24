// file: kube/pods.go (modificar a função existente)
package k8s

import (
	"context"
	"fmt"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type PodInfo struct {
	Nome      string `json:"nome"`
	Namespace string `json:"namespace"`
	Status    string `json:"status"`
	IP        string `json:"ip"`
	Node      string `json:"node"`
	Image     string `json:"image"`
}

// ListarPods agora retorna um slice de PodInfo e um erro.
func ListPods(namespace string) ([]PodInfo, error) {
	pods, err := client.CoreV1().Pods(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		// Retorna um slice vazio e o erro
		return nil, fmt.Errorf("erro ao listar pods: %w", err)
	}

	// Cria um slice de PodInfo para armazenar os resultados
	var podsInfo []PodInfo

	// Itera sobre a lista de pods retornada pela API
	for _, pod := range pods.Items {
		info := PodInfo{
			Nome:      pod.Name,
			Namespace: pod.Namespace,
			Status:    string(pod.Status.Phase), // pod.Status.Phase é do tipo v1.PodPhase
			IP:        pod.Status.PodIP,
			Node:      pod.Spec.NodeName,
			Image:     pod.Spec.Containers[0].Image,
		}
		podsInfo = append(podsInfo, info)
	}

	// Retorna o slice preenchido e nenhum erro
	return podsInfo, nil
}
