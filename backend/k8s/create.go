package k8s

import (
	"context"

	appsv1 "k8s.io/api/apps/v1"
	v1 "k8s.io/api/core/v1"
	netv1 "k8s.io/api/networking/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func CreatePod(namespace string, image string, name string) error {
	// create a pod definition
	podDefinition := &v1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			GenerateName: "go-api-",
			Namespace:    namespace,
			Name:         name,
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
	_, err := client.CoreV1().Pods(namespace).Create(context.Background(), podDefinition, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	return nil
}

func CreateDeployment(namespace, name, image string, replicas int32, containerPort int32) error {
	dep := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": name},
			},
			Template: v1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": name},
				},
				Spec: v1.PodSpec{
					Containers: []v1.Container{
						{
							Name:  name,
							Image: image,
							Ports: func() []v1.ContainerPort {
								if containerPort > 0 {
									return []v1.ContainerPort{{ContainerPort: containerPort}}
								}
								return nil
							}(),
						},
					},
				},
			},
		},
	}
	_, err := client.AppsV1().Deployments(namespace).Create(context.Background(), dep, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	return nil
}

func CreateSecret(namespace, name, secretType string, data map[string]string) error {
	byteData := map[string][]byte{}
	for k, v := range data {
		byteData[k] = []byte(v)
	}
	stype := v1.SecretType(secretType)
	sec := &v1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
		},
		Type: stype,
		Data: byteData,
	}
	_, err := client.CoreV1().Secrets(namespace).Create(context.Background(), sec, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	return nil
}
func CreateNs(name string) error {
	ns := &v1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
	}
	_, err := client.CoreV1().Namespaces().Create(context.Background(), ns, metav1.CreateOptions{})
	if err != nil {
	}
	return nil
}

func CreateIngress(namespace, name, host, serviceName string, servicePort int32) error {
	pathType := netv1.PathTypePrefix
	ing := &netv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
		},
		Spec: netv1.IngressSpec{
			Rules: []netv1.IngressRule{
				{
					Host: host,
					IngressRuleValue: netv1.IngressRuleValue{
						HTTP: &netv1.HTTPIngressRuleValue{
							Paths: []netv1.HTTPIngressPath{
								{
									Path:     "/",
									PathType: &pathType,
									Backend: netv1.IngressBackend{
										Service: &netv1.IngressServiceBackend{
											Name: serviceName,
											Port: netv1.ServiceBackendPort{Number: servicePort},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}
	_, err := client.NetworkingV1().Ingresses(namespace).Create(context.Background(), ing, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	return nil
}
