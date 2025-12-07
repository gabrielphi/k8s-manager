// file: kube/pods.go (modificar a função existente)
package k8s

import (
	"context"
	"fmt"
	"log"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

type PodInfo struct {
	Nome      string `json:"nome"`
	Namespace string `json:"namespace"`
	Status    string `json:"status"`
	IP        string `json:"ip"`
	Node      string `json:"node"`
	Image     string `json:"image"`
}
type DeploymentInfo struct {
	Nome          string            `json:"nome"`
	Namespace     string            `json:"namespace"`
	Status        string            `json:"status"`
	Image         string            `json:"image"`
	Replicas      int32             `json:"replicas"`
	ContainerPort int32             `json:"containerPort"`
	Selector      map[string]string `json:"selector"`
}
type ServiceInfo struct {
	Nome           string            `json:"nome"`
	Port           int32             `json:"port"`
	TargetPort     int32             `json:"targetPort"`
	Selector       map[string]string `json:"selector"`
	Type           string            `json:"type"`
	Namespace      string            `json:"namespace"`
	ClusterIP      string            `json:"clusterIP"`
	ExternalIP     string            `json:"externalIP"`
	LoadBalancerIP string            `json:"loadBalancerIP"`
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

func ListDeployments(namespace string) ([]DeploymentInfo, error) {
	deployments, err := client.AppsV1().Deployments(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("erro ao listar deployments: %w", err)
	}

	var deploymentsInfo []DeploymentInfo

	for _, deployment := range deployments.Items {
		var containerPort int32 = 0
		if len(deployment.Spec.Template.Spec.Containers) > 0 {
			if len(deployment.Spec.Template.Spec.Containers[0].Ports) > 0 {
				containerPort = deployment.Spec.Template.Spec.Containers[0].Ports[0].ContainerPort
			}
		}

		var image string
		if len(deployment.Spec.Template.Spec.Containers) > 0 {
			image = deployment.Spec.Template.Spec.Containers[0].Image
		}

		var replicas int32 = 0
		if deployment.Spec.Replicas != nil {
			replicas = *deployment.Spec.Replicas
		}

		status := "Unknown"
		if deployment.Status.ReadyReplicas == replicas && replicas > 0 {
			status = "Ready"
		} else if deployment.Status.ReadyReplicas < replicas {
			status = "NotReady"
		}

		info := DeploymentInfo{
			Nome:          deployment.Name,
			Namespace:     deployment.Namespace,
			Status:        status,
			Image:         image,
			Replicas:      replicas,
			ContainerPort: containerPort,
			Selector:      deployment.Spec.Selector.MatchLabels,
		}
		deploymentsInfo = append(deploymentsInfo, info)
	}
	return deploymentsInfo, nil
}

func ListServices(namespace string) ([]ServiceInfo, error) {
	services, err := client.CoreV1().Services(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("erro ao listar services: %w", err)
	}
	var servicesInfo []ServiceInfo
	for _, service := range services.Items {
		var port int32 = 0
		var targetPort int32 = 0
		if len(service.Spec.Ports) > 0 {
			port = service.Spec.Ports[0].Port
			// Verifica se TargetPort é IntVal ou StringVal
			if service.Spec.Ports[0].TargetPort.Type == intstr.Int {
				targetPort = service.Spec.Ports[0].TargetPort.IntVal
			}
		}

		var externalIP string
		if len(service.Spec.ExternalIPs) > 0 {
			externalIP = service.Spec.ExternalIPs[0]
		}

		var loadBalancerIP string
		if len(service.Status.LoadBalancer.Ingress) > 0 {
			loadBalancerIP = service.Status.LoadBalancer.Ingress[0].IP
		}
		// Se não tiver IP no Ingress, tenta pegar do spec (deprecated mas ainda pode existir)
		if loadBalancerIP == "" {
			loadBalancerIP = service.Spec.LoadBalancerIP
		}

		info := ServiceInfo{
			Nome:           service.Name,
			Port:           port,
			TargetPort:     targetPort,
			Selector:       service.Spec.Selector,
			Type:           string(service.Spec.Type),
			Namespace:      service.Namespace,
			ClusterIP:      service.Spec.ClusterIP,
			ExternalIP:     externalIP,
			LoadBalancerIP: loadBalancerIP,
		}
		servicesInfo = append(servicesInfo, info)
	}
	return servicesInfo, nil
}

func ListNamespaces() ([]string, error) {
	log.Printf("🔍 ListNamespaces: Iniciando busca por namespaces")

	namespace, err := client.CoreV1().Namespaces().List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		log.Printf("❌ Erro ao listar namespaces: %v", err)
		return nil, fmt.Errorf("erro ao listar namespaces: %w", err)
	}
	log.Printf("📋 Total de namespaces encontrados: %d", len(namespace.Items))

	var namespaces []string
	for _, ns := range namespace.Items {
		namespaces = append(namespaces, ns.Name)
		log.Printf("📝 Namespace: %s", ns.Name)
	}

	log.Printf("✅ ListNamespaces: Retornando %d namespaces", len(namespaces))
	return namespaces, nil
}
