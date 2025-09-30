import axios from "axios";

const API_URL = "/api/Station";

export default class StationService {
  static async getAll() {
    return axios.get(API_URL);
  }

  static async create(station) {
    return axios.post(API_URL, station);
  }

  static async update(id, station) {
    return axios.put(`${API_URL}/${id}`, station);
  }

  static async delete(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
}
