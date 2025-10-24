package k8s

import (
	"os"
	"path/filepath"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

var client *kubernetes.Clientset

func init() {
	home, _ := os.UserHomeDir()
	kubeConfigPath := filepath.Join(home, ".kube", "config")

	config, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
	if err != nil {
		panic(err.Error())
	}
	client = kubernetes.NewForConfigOrDie(config)
}
