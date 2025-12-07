import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPods, Pod, getNamespaces, Namespace, deletePod } from '../services/k8s';

function Pods() {
  const [pods, setPods] = useState<Pod[]>([]);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPods = async () => {
    try {
      setLoading(true);
      const data = await getPods(selectedNamespace);
      setPods(data);
    } catch (err) {
      setError(`Failed to fetch pods for namespace ${selectedNamespace}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchNamespaces = async () => {
      try {
        const data = await getNamespaces();
        setNamespaces(data);
      } catch (err) {
        setError('Failed to fetch namespaces');
      }
    };

    fetchNamespaces();
  }, []);

  useEffect(() => {
    fetchPods();
  }, [selectedNamespace]);

  const handleDeletePod = async (name: string, namespace: string) => {
    if (window.confirm(`Are you sure you want to delete pod ${name}?`)) {
      try {
        await deletePod(name, namespace);
        fetchPods();
      } catch (err) {
        setError(`Failed to delete pod ${name}`);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="text-blue-500 hover:text-blue-700">
        &larr; Back to Home
      </Link>
      <div className="flex justify-between items-center my-4">
        <h1 className="text-4xl font-bold">Pods</h1>
        <select
          value={selectedNamespace}
          onChange={(e) => setSelectedNamespace(e.target.value)}
          className="p-2 border rounded"
        >
          {namespaces.map((ns) => (
            <option key={ns.name} value={ns.name}>
              {ns.name}
            </option>
          ))}
        </select>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Namespace</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Restarts</th>
              <th className="py-2 px-4 border-b">Age</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pods.map((pod) => (
              <tr key={pod.name}>
                <td className="py-2 px-4 border-b">{pod.name}</td>
                <td className="py-2 px-4 border-b">{pod.namespace}</td>
                <td className="py-2 px-4 border-b">{pod.status}</td>
                <td className="py-2 px-4 border-b">{pod.restarts}</td>
                <td className="py-2 px-4 border-b">{pod.age}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleDeletePod(pod.name, pod.namespace)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Pods;
