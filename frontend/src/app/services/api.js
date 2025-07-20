import axios from "axios";

const WP_API_URL = "http://api.vagabondcafe.local:8080/wp-json/wp/v2";

const api = axios.create({
  baseURL: WP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPosts = async (page = 1, perPage = 10) => {
  const response = await api.get(
    `/posts?page=${page}&per_page=${perPage}&_embed`
  );
  return response.data;
};

export const getPost = async (slug) => {
  const response = await api.get(`/posts?slug=${slug}&_embed`);
  return response.data[0];
};

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export default api;
