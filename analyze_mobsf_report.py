import json
import sys

# Abre y lee el archivo JSON del reporte de MobSF
with open('./report/reporteMobsf.json') as f:
    report = json.load(f)

reporte_certificados=report['certificate_analysis']['certificate_summary']
reporte_manifiestos=report['manifest_analysis']['manifest_summary']
reporte_network=report['network_security']['network_summary']
reporte_code=report['code_analysis']['summary']

bandera=0

def mostrar_analisis (reporte,bandera):
  if reporte!={}:
    for key, value in reporte.items():
      if ((key == 'high' or key == 'warning')and(value > 0)):
        bandera=1
      print(f"{key}: {value}")
  else:
    print("No se encontraron hallazgos en el analisis especifico")
  return bandera

print("Reporte de certificados:")
bandera=mostrar_analisis(reporte_certificados,bandera)
print("Reporte de manifiesto:")
bandera=mostrar_analisis(reporte_manifiestos,bandera)
print("Reporte de network:")
bandera=mostrar_analisis(reporte_network,bandera)
print("Reporte de code:")
bandera=mostrar_analisis(reporte_code,bandera)

if bandera==0:
  print("No se encontraron hallazgos importantes en el analisis")
else:
  sys.exit(1)

