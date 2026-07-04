import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Session } from "../types";

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newToken, setNewToken] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Session[]>("/api/sessions");
      setSessions(response.data);
    } catch (err) {
      setError("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!newToken.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<Session>("/api/sessions", { token: newToken });
      setSessions((prev) => [...prev, response.data]);
      setNewToken("");
    } catch (err) {
      setError("Failed to create session.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/sessions/${id}`);
      setSessions((prev) => prev.filter((session) => session.id !== id));
    } catch (err) {
      setError("Failed to delete session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sessions</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="mb-4">
        <input
          type="text"
          value={newToken}
          onChange={(e) => setNewToken(e.target.value)}
          placeholder="New session token"
          className="border p-2 mr-2"
        />
        <button
          onClick={createSession}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Create Session
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {!loading && sessions.length === 0 && <div>No sessions found.</div>}
      {!loading && sessions.length > 0 && (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">User ID</th>
              <th className="border px-4 py-2">Token</th>
              <th className="border px-4 py-2">Created At</th>
              <th className="border px-4 py-2">Expires At</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td className="border px-4 py-2">{session.id}</td>
                <td className="border px-4 py-2">{session.user_id}</td>
                <td className="border px-4 py-2">{session.token}</td>
                <td className="border px-4 py-2">{new Date(session.created_at).toLocaleString()}</td>
                <td className="border px-4 py-2">{new Date(session.expires_at).toLocaleString()}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    disabled={loading}
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