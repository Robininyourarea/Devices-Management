import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    env: {
      baseUrl: 'http://localhost:5173',
      username: 'thisisnewuser23',
      email: 'thisisnewuser23@gmail.com',
      password: 'password123',
      wrongpassword: 'wrongpassword',
      devicename: 'Samsung Galaxy',
      type: 'Mobile phone',
      location: 'bed room',
      status: 'working',
      updatedevice: 'iPhone10s'
    }
  },
});
