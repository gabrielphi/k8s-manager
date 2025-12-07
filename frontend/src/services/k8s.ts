import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

export interface Pod {
  name: string;
  namespace: string;
  status: string;
  restarts: number;
  age: string;
}

export interface Namespace {
  name: string;
}

export interface CreateResourceRequest {
  kind: string;
  namespace: string;
  name: string;
  image?: string;
  replicas?: number;
  containerPort?: number;
  secretType?: string;
  data?: { [key: string]: string };
  host?: string;
  serviceName?: string;
  servicePort?: number;
}

export const getPods = async (namespace: string): Promise<Pod[]> => {
  const response = await axios.get(`${API_URL}/listAllPods/${namespace}`);
  return response.data;
};

export const getNamespaces = async (): Promise<Namespace[]> => {
  const response = await axios.get(`${API_URL}/listAllNs`);
  return response.data;
};

export const deletePod = async (name: string, namespace: string): Promise<void> => {
  await axios.post(`${API_URL}/deletePod`, { name, namespace });
};

export const createResource = async (resource: CreateResourceRequest): Promise<void> => {
  await axios.post(`${API_URL}/createResource`, resource);
};
