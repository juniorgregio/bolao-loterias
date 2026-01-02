import csv
import json

def parse_bettors_data(input_file, output_file):
    bettors_db = {}

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            # Skip the first line if it's just the file name or header that doesn't match CSV format perfectly
            # Based on the user's edit, the first line is "Data;Nome;Valor (R$);Cotas"
            # But the user also previously had "Lista-Apostadores" on line 1.
            # I'll check the first line.
            lines = f.readlines()
            
        start_index = 0
        if "Lista-Apostadores" in lines[0]:
            start_index = 1
        
        # Check if header exists
        if "Data;Nome" not in lines[start_index]:
             # Assuming NO header if it doesn't look like one, but looking at the user diff, 
             # line 1 is "Data;Nome;Valor (R$);Cotas"
             pass
        else:
            start_index += 1 # Skip header

        for line in lines[start_index:]:
            line = line.strip()
            if not line:
                continue
            
            parts = line.split(';')
            if len(parts) >= 4:
                date = parts[0].strip()
                name = parts[1].strip().upper() # Normalize name
                value_str = parts[2].strip().replace('.', '').replace(',', '.') # Convert "1.260,00" to 1260.00
                quotas_str = parts[3].strip().replace(',', '.')
                
                try:
                    value = float(value_str)
                    quotas = float(quotas_str)
                except ValueError:
                    print(f"Skipping invalid line: {line}")
                    continue

                if name not in bettors_db:
                    bettors_db[name] = {
                        "name": name,
                        "totalValue": 0.0,
                        "totalQuotas": 0.0,
                        "entries": []
                    }
                
                bettors_db[name]["entries"].append({
                    "date": date,
                    "value": value,
                    "quotas": quotas
                })
                bettors_db[name]["totalValue"] += value
                bettors_db[name]["totalQuotas"] += quotas

        # Convert to JS file format
        js_content = "const BETTORS_DATABASE = " + json.dumps(bettors_db, indent=4, ensure_ascii=False) + ";"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        print(f"Successfully converted {len(bettors_db)} bettors to {output_file}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    parse_bettors_data(
        r"c:\Users\ademar.gregio.junior\OneDrive - Accenture\Desktop\Ideias\Cursor\bolão\Lista-Apostadores.txt",
        r"c:\Users\ademar.gregio.junior\OneDrive - Accenture\Desktop\Ideias\Cursor\bolão\bettors-data.js"
    )
