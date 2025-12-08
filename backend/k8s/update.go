// backend/k8s/update.go
package k8s

import (
	"context"
	"fmt"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func ScaleDeployment(namespace, name string, replicas int32) error {
	if replicas < 0 {
		return fmt.Errorf("número de réplicas não pode ser negativo")
	}

	deployment, err := client.AppsV1().Deployments(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("deployment não encontrado: %w", err)
	}

	deployment.Spec.Replicas = &replicas
	_, err = client.AppsV1().Deployments(namespace).Update(context.TODO(), deployment, metav1.UpdateOptions{})
	if err != nil {
		return fmt.Errorf("erro ao escalar deployment: %w", err)
	}

	return nil
}

func UpdateDeploymentImage(namespace, name, image string) error {
	deployment, err := client.AppsV1().Deployments(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("deployment não encontrado: %w", err)
	}

	if len(deployment.Spec.Template.Spec.Containers) == 0 {
		return fmt.Errorf("deployment não possui containers")
	}

	deployment.Spec.Template.Spec.Containers[0].Image = image
	_, err = client.AppsV1().Deployments(namespace).Update(context.TODO(), deployment, metav1.UpdateOptions{})
	if err != nil {
		return fmt.Errorf("erro ao atualizar imagem: %w", err)
	}

	return nil
}

func RestartDeployment(namespace, name string) error {
	deployment, err := client.AppsV1().Deployments(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("deployment não encontrado: %w", err)
	}

	// Adiciona anotação para forçar restart
	if deployment.Spec.Template.ObjectMeta.Annotations == nil {
		deployment.Spec.Template.ObjectMeta.Annotations = make(map[string]string)
	}
	deployment.Spec.Template.ObjectMeta.Annotations["kubectl.kubernetes.io/restartedAt"] = metav1.Now().Format(time.RFC3339)

	_, err = client.AppsV1().Deployments(namespace).Update(context.TODO(), deployment, metav1.UpdateOptions{})
	if err != nil {
		return fmt.Errorf("erro ao reiniciar deployment: %w", err)
	}

	return nil
}
