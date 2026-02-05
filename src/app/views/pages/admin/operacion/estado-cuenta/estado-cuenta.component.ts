import { Component, OnInit, ViewChild } from '@angular/core';
import { WebdatarocksComponent } from 'ng-webdatarocks';
import * as WebDataRocks from 'webdatarocks';
import { EstadoCuentaService } from 'src/app/core/services/estado-cuenta.service';

@Component({
  selector: 'app-estado-cuenta',
  templateUrl: './estado-cuenta.component.html',
  styleUrls: ['./estado-cuenta.component.scss']
})
export class EstadoCuentaComponent implements OnInit {
  @ViewChild('pivot1') pivot1!: WebdatarocksComponent;

  constructor(private estadoCuentaService: EstadoCuentaService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.estadoCuentaService.getAllMovimientos().subscribe((data: any[]) => {
      const formattedData = data.map(item => ({
        "Fecha": item.fecha,
        "Monto MXN": item.montoMXNConSigno,
        "Monto USD": item.montoUSDConSigno,
        "Periodo": item.periodo ? `${item.periodo.mes}/${item.periodo.anio}` : '',
        "Grupo": item.grupo?.nombre || '',
        "Filial": item.filial?.nombre || '',
        "Observacion": item.observacion,
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
          ],
          columns: [
            { uniqueName: "Fecha.Year", caption: "Año" },
            { uniqueName: "Fecha.Month", caption: "Mes" }
          ],
          measures: [
            { uniqueName: "Monto MXN", aggregation: "sum", format: "currency", caption: "Monto MXN" },
            { uniqueName: "Monto USD", aggregation: "sum", format: "currency", caption: "Monto USD" }
          ]
        },
        formats: [{
            name: "currency",
            currencySymbol: "$",
            decimalPlaces: 2
        }],
          //localization: "https://cdn.webdatarocks.com/loc/es.json"
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
