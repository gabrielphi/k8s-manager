package k8s

import (
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func DeletePod(name string, namespace string) error {

	deleteErr := client.CoreV1().Pods(namespace).Delete(context.Background(), name, metav1.DeleteOptions{})
	if deleteErr != nil {
		panic(deleteErr.Error())
	}
	return nil
}
func DeleteDeployment(name string, namespace string) error {
	deleteErr := client.AppsV1().Deployments(namespace).Delete(context.Background(), name, metav1.DeleteOptions{})
	if deleteErr != nil {
		panic(deleteErr.Error())
	}
	return nil
}
func DeleteService(name string, namespace string) error {
	deleteErr := client.CoreV1().Services(namespace).Delete(context.Background(), name, metav1.DeleteOptions{})
	if deleteErr != nil {
		panic(deleteErr.Error())
	}
	return nil
}
func DeleteSecret(name string, namespace string) error {
	deleteErr := client.CoreV1().Secrets(namespace).Delete(context.Background(), name, metav1.DeleteOptions{})
	if deleteErr != nil {
		panic(deleteErr.Error())
	}
	return nil
}
