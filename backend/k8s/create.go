package k8s

import (
	"context"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func CreatePod(namespace string, image string, name string) {
	// create a pod defintion
	podDefintion := &v1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			GenerateName: "go-api-",
			Namespace:    namespace,
		},
		Spec: v1.PodSpec{
			Containers: []v1.Container{
				{
					Name:  name,
					Image: image,
				},
			},
		},
	}
	// create a new pod
	_, err := client.CoreV1().Pods(namespace).Create(context.Background(), podDefintion, metav1.CreateOptions{})
	if err != nil {
		panic(err.Error())
	}

}
