cd $(dirname "$0") && . ./changeDirectoryToBase.sh
cd client
gnome-terminal -- npm run dev
firefox http://localhost:5173/
