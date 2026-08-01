const server_url = 
import.meta.env.MODE === "development"? //mode is set by vite when we run 'npm run dev'
"http://localhost:3000":
import.meta.env.VITE_SERVER_URL; //when mode is production. Mode is set by vite when render runs 'npm run build'

export default server_url;