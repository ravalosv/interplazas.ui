import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'src/app/core/services/config.service';
import { produce } from 'immer';
import { AlertsService } from 'src/app/core/services/alerts.service';

export enum modalTypeEnum {
  nuevoGrupo,
  editarGrupo,
  nuevaUnidad,
  editarUnidad,
  nuevaFilial,
  editarFilial,
}

@Component({
  selector: 'app-estructura',
  templateUrl: './estructura.component.html',
  styleUrls: ['./estructura.component.scss'],
})
export class EstructuraComponent implements OnInit {
  constructor(
    private configService: ConfigService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private alertsService: AlertsService
  ) {}

  listOfMapData: TreeNodeInterface[] = [];

  public modalTypeEnum = modalTypeEnum;

  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};

  formGrupo!: FormGroup;

  ngOnInit(): void {
    this.initForm();

    this.configService.getGruposTree().subscribe((ret) => {
      this.listOfMapData = ret.data.map((item) => {
        return {
          key: item.id.toString().concat('g'),
          id: item.id.toString(),
          name: item.nombre,
          children: item.UnidadNegocios.map((uni) => {
            return {
              key: uni.id.toString().concat('u'),
              id: uni.id.toString(),
              name: uni.nombre,
              children: uni.Filiales.map((fil) => {
                return {
                  key: fil.id.toString().concat('f'),
                  id: fil.id.toString(),
                  name: fil.nombre,
                };
              }),
            };
          }),
        };
      });

      this.listOfMapData.forEach((item) => {
        this.mapOfExpandedData[item.key] = this.convertTreeToList(item);
      });
    });
  }

  initForm() {
    this.formGrupo = this.fb.group({
      nombreGrupo: ['', []],
      nombreUN: ['', []],
      nombre: ['', [Validators.required]],
    });
  }

  collapse(
    array: TreeNodeInterface[],
    data: TreeNodeInterface,
    $event: boolean
  ): void {
    if (!$event) {
      if (data.children) {
        data.children.forEach((d) => {
          const target = array.find((a) => a.key === d.key)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: TreeNodeInterface): TreeNodeInterface[] {
    const stack: TreeNodeInterface[] = [];
    const array: TreeNodeInterface[] = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, expand: false });

    while (stack.length !== 0) {
      const node = stack.pop()!;
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({
            ...node.children[i],
            level: node.level! + 1,
            expand: false,
            parent: node,
          });
        }
      }
    }

    return array;
  }

  visitNode(
    node: TreeNodeInterface,
    hashMap: { [key: string]: boolean },
    array: TreeNodeInterface[]
  ): void {
    if (!hashMap[node.key]) {
      hashMap[node.key] = true;
      array.push(node);
    }
  }

  modalTitle = '';
  fieldTitle = '';
  editType: modalTypeEnum | null = null;
  itemToUpdate: TreeNodeInterface | null | undefined = null;
  parentItem: TreeNodeInterface | null | undefined = null;

  modalTitles = {
    [modalTypeEnum.nuevoGrupo]: 'Nuevo Grupo',
    [modalTypeEnum.editarGrupo]: 'Editar Grupo',
    [modalTypeEnum.nuevaUnidad]: 'Nueva Unidad',
    [modalTypeEnum.editarUnidad]: 'Editar Unidad',
    [modalTypeEnum.nuevaFilial]: 'Nueva Filial',
    [modalTypeEnum.editarFilial]: 'Editar Filial',
  };

  fieldTitles = {
    [modalTypeEnum.nuevoGrupo]: 'Nombre del Grupo',
    [modalTypeEnum.editarGrupo]: 'Nombre del Grupo',
    [modalTypeEnum.nuevaUnidad]: 'Nombre de la Unidad',
    [modalTypeEnum.editarUnidad]: 'Nombre de la Unidad',
    [modalTypeEnum.nuevaFilial]: 'Nombre de la Filial',
    [modalTypeEnum.editarFilial]: 'Nombre de la Filial',
  };

  openEditorGrupo(
    content: TemplateRef<any>,
    type: modalTypeEnum,
    itemToUpdate?: TreeNodeInterface | null | undefined,
    parentItem?: TreeNodeInterface | null | undefined
  ) {
    this.modalTitle = this.modalTitles[type];
    this.fieldTitle = this.fieldTitles[type];

    this.editType = type;
    this.itemToUpdate = itemToUpdate;
    this.parentItem = parentItem;

    this.formGrupo.get('nombre')?.setValue('');
    if (itemToUpdate) {
      this.formGrupo.get('nombre')?.setValue(itemToUpdate.name);
    }

    this.adecuarModal(type);

    this.modalService
      .open(content, { size: 'sm' })
      .result.then((result) => {})
      .catch((res) => {});
  }

  nombreUNVisible() {
    // mostrar el nombre de la unidad solo cuando se edite una filial
    return (
      this.editType === modalTypeEnum.nuevaFilial ||
      this.editType === modalTypeEnum.editarFilial
    );

    return false;
  }

  nombreGrupoVisible() {
    // mostrar el nombre del grupo solo cuando se edite una unidad o filial
    return (
      this.editType !== modalTypeEnum.nuevoGrupo &&
      this.editType !== modalTypeEnum.editarGrupo
    );
  }

  adecuarModal(type: modalTypeEnum) {
    if (
      type === modalTypeEnum.nuevaUnidad ||
      type === modalTypeEnum.editarUnidad
    ) {
      this.formGrupo.get('nombreGrupo')?.setValue(this.parentItem?.name);
    } else if (
      type === modalTypeEnum.nuevaFilial ||
      type === modalTypeEnum.editarFilial
    ) {
      this.formGrupo
        .get('nombreGrupo')
        ?.setValue(this.parentItem?.parent?.name);
      this.formGrupo.get('nombreUN')?.setValue(this.parentItem?.name);
    }
  }

  guardarEstructura(cerrar: boolean) {
    if (this.formGrupo.invalid) return;

    if (this.editType === modalTypeEnum.nuevoGrupo) {
      this.addGrupo(cerrar);
    } else if (this.editType === modalTypeEnum.editarGrupo) {
      this.editGrupo(cerrar);
    } else if (this.editType === modalTypeEnum.nuevaUnidad) {
      this.addUnidadNegocio(cerrar);
    } else if (this.editType === modalTypeEnum.editarUnidad) {
      this.editUnidadNegocio(cerrar);
    } else if (this.editType === modalTypeEnum.nuevaFilial) {
      this.addFilial(cerrar);
    } else if (this.editType === modalTypeEnum.editarFilial) {
      this.editFilial(cerrar);
    }
  }

  deleteEstructura(itemToDelete: TreeNodeInterface) {
    if (itemToDelete.level === 0) {
      this.deleteGrupo(itemToDelete);
    } else if (itemToDelete.level === 1) {
      this.deleteUnidadNegocio(itemToDelete);
    } else if (itemToDelete.level === 2) {
      this.deleteFilial(itemToDelete);
    }
  }

  editGrupo(cerrar: boolean) {
    if (!this.itemToUpdate) return;

    this.configService
      .updateGrupo(this.itemToUpdate.id, this.formGrupo.value.nombre)
      .subscribe((ret) => {
        if (ret.error) {
          this.alertsService.error(ret.error);
          return;
        }

        this.listOfMapData = produce(this.listOfMapData, (draft) => {
          const index = draft.findIndex(
            (item) => item.id === this.itemToUpdate?.id
          );

          draft[index].name = this.formGrupo.value.nombre;
        });

        this.listOfMapData.forEach((item) => {
          this.mapOfExpandedData[item.key] = this.convertTreeToList(item);
        });

        this.itemToUpdate = null;
        this.editType = modalTypeEnum.nuevoGrupo;
        this.formGrupo.get('nombre')?.setValue('');
        this.formGrupo.markAsUntouched();

        this.alertsService.success('Grupo actualizado con éxito');

        if (cerrar) {
          this.modalService.dismissAll();
        }
      });
  }

  addGrupo(cerrar: boolean) {
    this.configService
      .createGrupo(this.formGrupo.value.nombre)
      .subscribe((ret) => {
        if (ret.error) {
          this.alertsService.error(ret.error);
          return;
        }
        this.listOfMapData = produce(this.listOfMapData, (draft) => {
          const maped = {
            key: ret.data.id.toString().concat('g'),
            id: ret.data.id.toString(),
            name: ret.data.nombre,
            children: [],
          };

          draft.push(maped);

          this.mapOfExpandedData[ret.data.id.toString().concat('g')] =
            this.convertTreeToList(maped);
        });

        this.formGrupo.get('nombre')?.setValue('');
        this.formGrupo.markAsUntouched();

        this.alertsService.success('Grupo creado con éxito');

        if (cerrar) {
          this.modalService.dismissAll();
        }
      });
  }

  deleteGrupo(itemToDelete: TreeNodeInterface) {
    this.alertsService.confirm({
      titulo: '¿Está seguro que desea eliminar este grupo?',
      message:
        'Se eliminará toda la estructura dependiente de este grupo. Esta acción no se puede deshacer',
      okCallback: () => {
        this.configService.deleteGrupo(itemToDelete.id).subscribe((ret) => {
          if (ret.error) {
            this.alertsService.error(ret.error);
            return;
          }

          this.listOfMapData = this.listOfMapData.filter((item) => {
            return item.key !== itemToDelete.key;
          });

          this.alertsService.success('Grupo eliminado con éxito');
        });
      },
      noCallback: () => {
        return;
      },
    });
  }

  addUnidadNegocio(cerrar: boolean) {
    this.configService
      .createUnidadNegocio(this.parentItem!.id, this.formGrupo.value.nombre)
      .subscribe((ret) => {
        if (ret.error) {
          this.alertsService.error(ret.error);
          return;
        }
        this.listOfMapData = produce(this.listOfMapData, (draft) => {
          const maped = {
            key: ret.data.id.toString().concat('g'),
            id: ret.data.id.toString(),
            name: ret.data.nombre,
            children: [],
          };

          draft
            .find((item) => item.id === this.parentItem!.id)
            ?.children?.push(maped);
        });

        this.listOfMapData.forEach((item) => {
          this.mapOfExpandedData[item.key] = this.convertTreeToList(item);
        });

        this.itemToUpdate = null;
        this.editType = modalTypeEnum.nuevaUnidad;

        this.formGrupo.get('nombre')?.setValue('');
        this.formGrupo.markAsUntouched();

        this.alertsService.success('Unidad de negocio creada con éxito');

        if (cerrar) {
          this.modalService.dismissAll();
        }
      });
  }

  editUnidadNegocio(cerrar: boolean) {
    if (!this.itemToUpdate) return;

    this.configService
      .updateUnidadNegocio(this.itemToUpdate.id, this.formGrupo.value.nombre)
      .subscribe((ret) => {
        if (ret.error) {
          this.alertsService.error(ret.error);
          return;
        }

        this.listOfMapData = produce(this.listOfMapData, (draft) => {
          const index = draft
            .find((item) => item.id === this.parentItem?.id)
            ?.children?.findIndex((item) => item.id === this.itemToUpdate?.id);

          draft
            .find((item) => item.id === this.parentItem?.id)
            ?.children?.splice(index!, 1, {
              key: this.itemToUpdate!.id.concat('u'),
              id: this.itemToUpdate!.id,
              name: this.formGrupo.value.nombre,
              children: [],
            });
        });

        this.listOfMapData.forEach((item) => {
          this.mapOfExpandedData[item.key] = this.convertTreeToList(item);
        });

        this.itemToUpdate = null;
        this.editType = modalTypeEnum.nuevaUnidad;

        this.formGrupo.get('nombre')?.setValue('');
        this.formGrupo.markAsUntouched();

        this.alertsService.success('Unidad de negocio actualizada con éxito');

        if (cerrar) {
          this.modalService.dismissAll();
        }
      });
  }

  deleteUnidadNegocio(itemToDelete: TreeNodeInterface) {
    this.alertsService.confirm({
      titulo: '¿Está seguro que desea eliminar esta unidad de negocio?',
      message:
        'Se liminarán las Filiales asociadas. Esta acción no se puede deshacer',
      okCallback: () => {
        this.configService
          .deleteUnidadNegocio(itemToDelete.id)
          .subscribe((ret) => {
            if (ret.error) {
              this.alertsService.error(ret.error);
              return;
            }

            this.listOfMapData = produce(this.listOfMapData, (draft) => {
              const parent = draft.find(
                (item) => item.id === itemToDelete?.parent?.id
              );

              const index = parent?.children?.findIndex(
                (item) => item.id === itemToDelete.id
              );

              parent?.children?.splice(index!, 1);
            });

            this.listOfMapData.forEach((item) => {
              this.mapOfExpandedData[item.key] = this.convertTreeToList(item);
            });

            this.alertsService.success('Unidad de negocio eliminada con éxito');
          });
      },
      noCallback: () => {
        return;
      },
    });
  }

  addFilial(cerrar: boolean) {
    this.configService
      .createFilial(this.parentItem!.id, this.formGrupo.value.nombre)
      .subscribe((ret) => {
        if (ret.error) {
          this.alertsService.error(ret.error);
          return;
        }

        this.listOfMapData = produce(this.listOfMapData, (draft) => {
          const maped = {
            key: ret.data.id.toString().concat('f'),
            id: ret.data.id.toString(),
            name: ret.data.nombre,
          };

          const groupParent = draft.find(
            (item) => item.id === this.parentItem?.parent?.id
          );

          const UNParent = groupParent?.children?.find(
            (item) => item.id === this.parentItem?.id
          );

          UNParent?.children?.push(maped);
        });

        this.listOfMapData.forEach((item) => {
          this.mapOfExpandedData[item.key] = this.convertTreeToList(item);
        });

        this.itemToUpdate = null;
        this.editType = modalTypeEnum.nuevaFilial;

        this.formGrupo.get('nombre')?.setValue('');
        this.formGrupo.markAsUntouched();

        this.alertsService.success('Filial creada con éxito');

        if (cerrar) {
          this.modalService.dismissAll();
        }
      });
  }

  editFilial(cerrar: boolean) {
    if (!this.itemToUpdate) return;

    this.configService
      .updateFilial(this.itemToUpdate.id, this.formGrupo.value.nombre)
      .subscribe((ret) => {
        if (ret.error) {
          this.alertsService.error(ret.error);
          return;
        }

        this.listOfMapData = produce(this.listOfMapData, (draft) => {
          const groupParent = draft.find(
            (item) => item.id === this.parentItem?.parent?.id
          );

          const UNParent = groupParent?.children?.find(
            (item) => item.id === this.parentItem?.id
          );

          const index = UNParent?.children?.findIndex(
            (item) => item.id === this.itemToUpdate?.id
          );

          UNParent?.children?.splice(index!, 1, {
            key: this.itemToUpdate!.id.concat('f'),
            id: this.itemToUpdate!.id,
            name: this.formGrupo.value.nombre,
          });
        });

        this.listOfMapData.forEach((item) => {
          this.mapOfExpandedData[item.key] = this.convertTreeToList(item);
        });

        this.itemToUpdate = null;
        this.editType = modalTypeEnum.nuevaFilial;

        this.formGrupo.get('nombre')?.setValue('');
        this.formGrupo.markAsUntouched();

        this.alertsService.success('Filial actualizada con éxito');

        if (cerrar) {
          this.modalService.dismissAll();
        }
      });
  }

  deleteFilial(itemToDelete: TreeNodeInterface) {
    this.alertsService.confirm({
      titulo: '¿Está seguro que desea eliminar esta filial?',
      message: 'Esta acción no se puede deshacer',
      okCallback: () => {
        this.configService.deleteFilial(itemToDelete.id).subscribe((ret) => {
          if (ret.error) {
            this.alertsService.error(ret.error);
            return;
          }

          this.listOfMapData = produce(this.listOfMapData, (draft) => {
            const groupParent = draft.find(
              (item) => item.id === itemToDelete.parent?.parent?.id
            );

            const UNParent = groupParent?.children?.find(
              (item) => item.id === itemToDelete.parent?.id
            );

            const index = UNParent?.children?.findIndex(
              (item) => item.id === itemToDelete.id
            );

            UNParent?.children?.splice(index!, 1);
          });

          this.listOfMapData.forEach((item) => {
            this.mapOfExpandedData[item.key] = this.convertTreeToList(item);
          });

          this.alertsService.success('Filial eliminada con éxito');
        });
      },
      noCallback: () => {
        return;
      },
    });
  }
}

export interface TreeNodeInterface {
  key: string;
  id: string;
  name: string;
  level?: number;
  expand?: boolean;
  children?: TreeNodeInterface[];
  parent?: TreeNodeInterface;
}
