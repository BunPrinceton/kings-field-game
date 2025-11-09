#!/bin/bash

echo '{'
echo '  "paintings": ['

first=true

# Process portraits
for file in portraits/*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        id="${filename%.*}"
        dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
        
        if [ "$first" = true ]; then
            first=false
        else
            echo ','
        fi
        
        echo -n '    {
      "id": "portrait_'"$id"'",
      "path": "portraits/'"$filename"'",
      "category": "portrait",
      "dimensions": "'"$dimensions"'",
      "style": "classical",
      "license": "CC0"
    }'
    fi
done

# Process landscapes
for file in landscapes/*.{jpg,png,gif}; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        id="${filename%.*}"
        dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
        
        if [ "$first" = true ]; then
            first=false
        else
            echo ','
        fi
        
        category="landscape"
        style="medieval"
        
        # Categorize based on filename
        if [[ "$filename" == *"dragon"* ]] || [[ "$filename" == *"ruins"* ]]; then
            style="ps1_rpg"
        elif [[ "$filename" == *"mountain"* ]]; then
            style="ps1_rpg"
        elif [[ "$filename" == *"castle"* ]]; then
            style="fantasy"
        fi
        
        echo -n '    {
      "id": "landscape_'"$id"'",
      "path": "landscapes/'"$filename"'",
      "category": "landscape",
      "dimensions": "'"$dimensions"'",
      "style": "'"$style"'",
      "license": "CC0"
    }'
    fi
done

echo ''
echo '  ],'
echo '  "metadata": {'
echo '    "total_count": '$(ls portraits/*.png landscapes/*.{jpg,png,gif} 2>/dev/null | wc -l)','
echo '    "portrait_count": '$(ls portraits/*.png 2>/dev/null | wc -l)','
echo '    "landscape_count": '$(ls landscapes/*.{jpg,png,gif} 2>/dev/null | wc -l)','
echo '    "sources": ['
echo '      {"name": "30 Medieval Paintings Pack", "url": "https://opengameart.org/content/30-public-domain-paintings"},'
echo '      {"name": "PS1 RPG Backgrounds", "url": "https://opengameart.org/content/ps1-pre-rendered-backgrounds"},'
echo '      {"name": "Public Domain Portraits", "url": "https://opengameart.org/content/pd-200x200-portraits"}'
echo '    ]'
echo '  }'
echo '}'
