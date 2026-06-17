import { Component, OnInit, ViewChild } from '@angular/core';
import { WebdatarocksComponent } from 'ng-webdatarocks';
import * as WebDataRocks from 'webdatarocks';
import { EstadoCuentaService } from 'src/app/core/services/estado-cuenta.service';

@Component({
  selector: 'app-estado-cuenta-detallado',
  templateUrl: './estado-cuenta-detallado.component.html',
  styleUrls: ['./estado-cuenta-detallado.component.scss']
})
export class EstadoCuentaDetalladoComponent implements OnInit {
  @ViewChild('pivot1') pivot1!: WebdatarocksComponent;

  constructor(private estadoCuentaService: EstadoCuentaService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.estadoCuentaService.getAllMovimientos().subscribe((data: any[]) => {
      const formattedData = data.map(item => ({
        "Fecha": item.fecha,
        "Monto MXN": item.montoMXN,
        "Monto USD": item.montoUSD,
        "montoMXNAbs": item.montoMXNAbs,
        "montoUSDAbs": item.montoUSDAbs,
        "Periodo": item.periodo ? `${item.periodo.nombre}` : '',
        "Grupo": item.grupo?.nombre || '',
        "Filial": item.filial?.nombre || '',
        "Comentarios": item.observacion,
        "Tipo Movimiento": item.tipoMovimiento?.nombre || '',
        "Creado El": item.createdAt
      }));

      this.pivot1.webDataRocks.setReport({
        dataSource: {
          data: formattedData
        },
        slice: {
          rows: [
            { uniqueName: "Grupo" },
            { uniqueName: "Filial" },
            { uniqueName: "Periodo" },
            { uniqueName: "Comentarios" }
          ],
          columns: [
            { uniqueName: "Fecha.Year", caption: "Año" },
            { uniqueName: "Fecha.Month", caption: "Mes" }
          ],
          measures: [
            { uniqueName: "Monto MXN", aggregation: "sum", format: "currencyMXN", caption: "Monto MXN" },
            { uniqueName: "Monto USD", aggregation: "sum", format: "currencyUSD", caption: "Monto USD" },
          ]
        },
        formats: [{
            name: "currencyMXN",
            currencySymbol: "MX$",
            decimalPlaces: 2
        }, {
            name: "currencyUSD",
            currencySymbol: "US$",
            decimalPlaces: 2
        }],
        options: {
          grid: {
            type: "classic"
          }
        },
          localization: "assets/lang/pivot-es.json"
      } as any);
    });
  }

  customizeToolbar(toolbar: any) {
    const tabs = toolbar.getTabs();
    toolbar.getTabs = () => {
      const filteredTabs = tabs.filter((tab: any) => 
        tab.id !== "wdr-tab-connect" && 
        tab.id !== "wdr-tab-open" && 
        tab.id !== "wdr-tab-save"
      );

      filteredTabs.forEach((tab: any) => {
        if (tab.id === "wdr-tab-export") tab.title = "Exportar";
        if (tab.id === "wdr-tab-format") tab.title = "Formato";
        if (tab.id === "wdr-tab-options") tab.title = "Opciones";
        if (tab.id === "wdr-tab-fields") tab.title = "Campos";
        if (tab.id === "wdr-tab-fullscreen") tab.title = "Pantalla completa";
      });

      return filteredTabs;
    };
  }

  onPivotReady(pivot: WebDataRocks.Pivot): void {
    // console.log('[ready] WebDataRocksPivot');
  }
}
