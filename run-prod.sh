read -p "Do you want to rebuild? " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
   npm run build
fi

mkdir dist/assets
mv dist/panel dist/assets

if ! grep -q BaseURL "dist/index.html"; then
   source .env
   sed -i "1i<script>\n    window.Wisp = {Debug: true, Node: \'local\', Version: \'dev\', BaseURL: \'$VITE_PANEL_URL\' };\n</script>\n" dist/index.html
fi

cd dist
python3 -m http.server
cd ../
