const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const searchDictionary = async (query) => {
  const trimmed = query?.trim();
  if (!trimmed) return null;

  const token = sessionStorage.getItem("token");

  let res;
  try {
    res = await fetch(
      `${API_BASE}/api/dictionary/search?q=${encodeURIComponent(trimmed)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
  } catch (networkErr) {
    // Genuine network failure (server down, DNS, CORS preflight rejected, etc.)
    console.error("Dictionary network error:", networkErr);
    throw new Error("Couldn't reach the dictionary. Check your connection.");
  }

  if (res.status === 404) {
    return { notFound: true };
  }

  if (!res.ok) {
    // Surface the real status instead of masking every failure the same way.
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Dictionary lookup failed (${res.status})`);
  }

  return res.json();
};