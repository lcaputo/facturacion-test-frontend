import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {MatSort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppService } from 'src/app/services/app.service';
import swal from 'sweetalert2';

// INTERFACE FACTURA
export interface Bill {
  id                        : number;
  active                    : number;
  employee_id               : number;
  client_id                 : number;
  price                     : number;
  iva                       : number;
  total                     : number;
  created_at                : string;
  updated_at                : string;
}
// INTERFACE PRODUCTO
export interface Product {
  id                        : number;
  active                    : number;
  name                      : string;
  description               : string;
  price                     : number;
  created_at                : string;
  updated_at                : string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  // VARIABLES
  public productForm!       : FormGroup;
  public billForm!          : FormGroup;
  public clientForm!        : FormGroup;
  public view               : string = '';
  public bills              : any = {};
  public products           : any = {};
  public billDetail         : any = {};
  public isLoading          : boolean = false;
  public loadingBills       : boolean = false;
  public loadingProducts    : boolean = false;
  public loadingProductForm : boolean = false;
  public loadingDetails     : boolean = false;
  public productUpdateId!   : number;
  public productSearch      : string = '';
  public billSearch         : string = '';

    // CREAR TABLA DE FACTURACIÓN
    billDataSource = new MatTableDataSource();
    // COLUMNAS QUE SE MOSTRARAN EN LA TABLA PRINCIPAL DE FACTURACIÓN
    displayedBillColumns: string[] = ['id', 'employee', 'client', 'total', 'created_at', 'actions'];
    // SELECTOR REFERENCIA CLASIFICADOR TABLA FACTURACIÓN
    @ViewChild('billTable') billSort!: MatSort;
    // SELECTOR REFERENCIA TABLA PAGINADOR FACTURACIÓN
    @ViewChild('billPaginator') billPaginator!: MatPaginator;

    displayedProductColumns: string[] = ['id', 'name', 'price', 'actions'];
    productDataSource = new MatTableDataSource();
    clickedProductsRows = new Set<any>();
    @ViewChild('productSort') productSort!: MatSort;
    @ViewChild('productPaginator') productPaginator!: MatPaginator;
    
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private _snackBar: MatSnackBar,
    private service: AppService,
  ) { }

  // ACCIONES AL INICIAR EL COMPONENTE
  ngOnInit(): void {
    // LISTAR FACTURAS
    this.getBills();
    // FORMULARIO DE PRODUCTOS
    this.productForm = this.fb.group({
      name: ['', [
          Validators.required, 
      ]],
      price: ['', [
          Validators.required,
      ]],
      description: ['', [
        Validators.required
      ]],
    })
    // FORMULARIO DE FACTURAS
    this.billForm = this.fb.group({
      employee_id: [''],
      client_id: [''],
      price: ['', [
          Validators.required
      ]],
      iva: ['', [
        Validators.required
      ]],
      total: ['', [
        Validators.required
      ]],
    })
    // FORMULARIO DE CLIENTE
    this.clientForm = this.fb.group({
      name: ['', [
        Validators.required
      ]],
      CC: ['', [
        Validators.required
      ]],
    })
  }

  // MÉTODO QUE SE EJECUTA AL ENVIAR EL FORMULARIO DE FACTURACIÓN
  public submitBill() {
    console.log('Submit Bill', this.clientForm.value);
    // VARIABLES DENTRO DEL METODO
    let client_id   : number;
    let employee_id : number;
    let price       : number = this.sumTotal();
    let bill_id     : number;
    // VALIDAR FORMULARIO
    if ( this.clientForm.valid ) {
      // VALIDAR QUE EL CARRITO ESTÁ LLENO, VERIFICANDO EL PRECIO TOTAL
      if ( this.sumTotal() > 0 ) {
        this.loadingBills = true;
        document.getElementById('closeButton')?.click()
        // CREAR CLIENTE NUEVO
        this.service.post('/client/create', this.clientForm.value).subscribe(
          (res:any) => {
            client_id = res.client.id
            // PEDIR DATOS DEL USUARIO QUE TIENE SESIÓN INICIADA
            this.service.get('/me').subscribe(
              (res:any) => {
                employee_id = res.id
                // LLENAR FORMULARIO PARA PETICION DE CREAR FACTURA
                this.billForm.patchValue({
                  employee_id: employee_id,
                  client_id: client_id,
                  price: price,
                  iva: price*0.19,
                  total: price + (price*0.19)
                })
                // PETICIÓN PARA CREAR FACTURA
                this.service.post('/bill/create', this.billForm.value).subscribe(
                  (res:any) => {
                    bill_id = res.bill.id
                    this.clickedProductsRows.forEach(item =>{
                      console.log('ITEM', item);
                      // AGREGANDO PRODUCTOS AL DETALLE DE LA FACTURA
                      this.service.post('/bill/detail/create', {
                        bill_id: bill_id,
                        product_id: item.id
                      }).subscribe(
                        (res:any) => 
                        {
                          // LIMPIAR FORMULARIO DE CLIENTE
                          this.clientForm.reset()
                          // LIMPIAR CARRITO
                          this.clickedProductsRows.clear()
                          // ACTUALIZAR FACTURAS
                          this.getBills()
                        }
                      )
                
                    });
                  }
                )
              }
            )
          },
          (err:any) => {}
        )
      } else {
        swal.fire('Alerta', 'Primero añade productos al carrito.', 'warning')
      }
    }
  }

  ngAfterViewInit() {
    // INICIALIZAR CLASIFICADORES Y PAGINADORES PARA LAS TABLAS DE MATERIAL
    this.billDataSource.sort = this.billSort;
    this.billDataSource.paginator = this.billPaginator;
    this.productDataSource.sort = this.productSort;
    this.productDataSource.paginator = this.productPaginator;
  }

  // CREAR PRODUCTOS
  createProduct() {
    // ACTIVAR CARGANDO DE SECCIONES Y BOTONES 
    this.isLoading = true;
    this.loadingProductForm = true;
    this.service.post('/product/create', this.productForm.value).subscribe(
      (res:any) => {
        console.log('create product response', res);
        // REGRESAR A LA VISTA DE FACTURACIÓN
        this.view = '';
        // VOLVER A LISTAR PRODUCTOS
        this.listProducts();
        this.isLoading = false;
        this.loadingProductForm = false;
        // LIMPIAR FORMULARIO DE PRODUCTO
        this.productForm.reset()
        // MOSTRAR DIALOGO/ALERTA DE ÉXITO
        swal.fire('Exito!', 'Producto creado.')
      },
      (err:any) => {
        console.log('Error creando el producto', err);
        this.isLoading = false;
        this.loadingProductForm = false;
      }
    )
  }

  // ACTUALIZAR PRODUCTO
  updateProduct() {
    this.loadingProductForm = true;
    // PETICION ACTUALIZAR
    this.service.patch(`/product/update/${this.productUpdateId}`, this.productForm.value).subscribe(
      (res:any) => {
        // VOLVER A LISTAR CON LOS NUEVOS VALORES
        this.listProducts();
        // REGRESAR A LA VISTA DE FACTURACIÓN
        this.view = '';
        this.loadingProductForm = false;
      },
      (err:any) => {
        this.loadingProductForm = false;
      }
    )
  }

  // HACER VISIBLE LA VENTANA MODAL CON EL FORMULARIO PARA EDITAR UN PRODUCTO
  editProductView(id:number) {
    this.productUpdateId = id;
    // NOMBRE DE LA VISTA PARA OCULTAR/MOSTRAR COMPONENTES 
    this.view = 'UPDATE_PRODUCT'
    // ACTIVAR CARGANDO
    this.loadingProductForm = true;
    console.log(id)
    this.service.get(`/product/${id}`).subscribe(
      (res:any) => {
        res = res.product
        console.log('PRODUCT', res)
        // LLENAR FORMULARIO CON LA RESPUESTA DE LA PETICIÓN
        this.productForm.patchValue({
          name: res.name,
          price: res.price,
          description: res.description
        })
        // DESACTIVAR CARGANDO
        this.loadingProductForm = false;
      },
      (err:any) => {
        // MANEJO DE ERRORES
        console.log('Error consultando producto', err)
        this.loadingProductForm = false;
      }
    )
  }

  // LISTAR TODOS LOS PRODUCTOS
  listProducts() {
    this.loadingProducts = true;
    this.service.get('/product/list').subscribe(
      (res:any) => {
        console.log(res);
        this.products = res;
        this.productDataSource.data = res as Product[];
        this.loadingProducts = false;
      },
      (err:any) =>{
        console.log('Error', err)
        this.openSnackBar('Error al consultar los productos', 'ok')
        this.loadingProducts = false;
      }
    )
  }

  // MÉTODO BORRAR PRODUCTO
  deleteProduct(id: number, name: string) {
    swal.fire({
      title: `Desea borrar el item #${id}: ${name}?`,
      showDenyButton: true,
      confirmButtonText: `Borrar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingProducts = true;
        this.service.delete(`/product/delete/${id}`).subscribe(
          (res:any) => {
            this.listProducts()
          },
          (err:any) => {
            this.loadingProducts = false;
          }
        )
        swal.fire('Eliminado!', '', 'success')
      }
    })
  }

  // VALIDACIÓN POR SI UN CLIENTE YA SE ENCUNTRA REGISTRADO
  validateClientDocument(document: number) {
    this.service.get(`/client/${document}`).subscribe(
      (res: any) => {
        res = res.client;
        // TODO: VALIDAR SI EL NUMERO DE DOCUMENTO YA SE ENCUENTRA REGISTRADO
      },
      (err: any) => {}
    )
  }


  submitProductForm() {
    if ( this.view === 'CREATE_PRODUCT' ) {
      this.createProduct()
    } else if ( this.view === 'UPDATE_PRODUCT' ) {
      this.updateProduct()
    }
  }

  // LISTAR TODAS LAS FACTURAS
  getBills() {
    this.loadingBills = true;
    this.service.get('/bill/list').subscribe(
      (res:any) => {
        console.log('bills', res)
        this.billDataSource.data = res as Bill[];
        this.loadingBills = false;
      },
      (err:any) =>{
        console.log('Error', err)
        this.openSnackBar('Error al consultar las facturas', 'ok')
        this.loadingBills = false;
      }
    )
  }

  // LISTAR DETALLES DE UNA FACTURA
  getDetails(id:number) {
    this.loadingDetails = true;
    this.billDetail = {};
    this.service.get(`/bill/${id}`).subscribe(
      (res:any) => {
        this.billDetail['id'] = res.id,
        this.billDetail['employee'] = res.employee_id
        this.billDetail['client'] = res.client_id
        this.billDetail['active'] = res.active
        this.billDetail['price'] = res.price
        this.billDetail['iva'] = res.iva
        this.billDetail['total'] = res.total
        this.billDetail['created_at'] = res.created_at
        this.service.get(`/bill/detail/${id}`).subscribe(
          (res:any) => {
            let array: any[] = [];
            res.forEach((elm:any, index:number) => {
              console.log('foreach', elm)
              this.service.get(`/product/${elm.product_id}`).subscribe(
                (response:any) => {
                  array.push({
                    name: response.name,
                    price: response.price
                  });
                }
              )      
            });
            this.service.get(`/user/${this.billDetail['employee']}`).subscribe(
              (user:any) => {
                this.billDetail['employee_name'] = user.name
                this.billDetail['employee_document'] = user.nit
                console.log(this.billDetail['employee'])
              }
            )
            this.service.get(`/client/${this.billDetail['client']}`).subscribe(
              (x:any) => {
                let client = x.client
                this.billDetail['client_name'] = client.name
                this.billDetail['client_document'] = client.CC
                this.loadingDetails = false;
              }
            )
            this.billDetail['products']  = array
            console.log('MIRA AQUI', this.billDetail)
          },
          (err:any) => {
            this.loadingDetails = false;
          }
        )
      }
    )
  }

  // SUMATORIA DE TODOS LOS ITEMS DEL CARRITO
  sumTotal(){
    let total: number = 0
    this.clickedProductsRows.forEach(elm => {
      total += parseInt(elm.price)
    });
    return total;
  }

  // MÉTODO PARA BORRAR FACTURAS
  deleteBill(id:number) {
    swal.fire({
      title: `Desea borrar el item #${id}`,
      showDenyButton: true,
      confirmButtonText: `Borrar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingBills = true;
        this.service.delete(`/bill/delete/${id}`).subscribe(
          (res:any) => {
            console.log('Bill deleted.')
            this.getBills()
          },
          (err:any) => {
            this.loadingBills = false;
          }
        )
        swal.fire('Exito!', 'Factura eliminada.', 'success')
      }
    })
  }

  // FILTRO PARA BUSCAR EN LA TABLA DE PRODUCTOS
  productSearchFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.productDataSource.filter = filterValue.trim().toLowerCase();
  }

  // FILTRO PARA BUSCAR EN LA TABLA DE FACTURAS
  billSearchFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.billDataSource.filter = filterValue.trim().toLowerCase();
  }

  // HACER VISIBLE LA VENTANA DE CREAR PRODUCTO
  showCreateProductView(): void {
    this.view = 'CREATE_PRODUCT';
  }

  // DISPARAR ALERTAS PARA INFORMACIÓN DEL USUARIO
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  // CERRAR SESIÓN
  logout() {
    this.auth.logout();
    this.openSnackBar('Hasta Pronto :)', 'listo');
  }
    
}

