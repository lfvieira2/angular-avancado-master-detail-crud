import { AfterContentChecked, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseResourceModel } from '../../moldes/base-resource.model'; 
import { BaseResourceService } from '../../services/base-resource.service';

import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currenctAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
    
  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    protected Injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T,
  ){
    this.route = this.Injector.get(ActivatedRoute);
    this.router = this.Injector.get(Router);
    this.formBuilder = this.Injector.get(FormBuilder);
  }

  ngOnInit() {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;

    if(this.currenctAction == 'new')
      this.createResource();
    else 
      this.updateResource();
  }

  // protected methods
  protected setCurrentAction() {
    if (this.route.snapshot.url[0].path == 'new')
      this.currenctAction = 'new';
    else
      this.currenctAction = 'edit';
  }

  protected loadResource() {
    if (this.currenctAction == 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get('id')))
      )
        .subscribe(
          (resource) => {
            this.resource = resource;
            this.resourceForm.patchValue(resource); // binds loaded resource data to resourceForm
          },
          (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
        )
    }
  }

  protected setPageTitle() {
    if (this.currenctAction == 'new')
      this.pageTitle = this.creationPageTitle();
    else {
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string {
    return 'Novo'
  }

  protected editionPageTitle(): string {
    return 'Edição'
  }

  protected createResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.create(resource)
    .subscribe(
      resource => this.actionsForSuccess(resource),
      error => this.actionsForError(error)
    )
  }

  protected updateResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.update(resource)
    .subscribe(
      resource => this.actionsForSuccess(resource),
      error => this.actionsForError(error)
    )
  }

  protected actionsForSuccess(resource: T){
    toastr.success('Solicitação processada com sucesso!');
    const baseComponentPath: string = this.route.snapshot.parent.url[0].path;

    // redirect/reload component page
    this.router.navigateByUrl(baseComponentPath, {skipLocationChange: true}).then(
      () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
    )
  }

  protected actionsForError(error){
    toastr.error('Ocorreu um erro ao processar sua solicitação!');

    this.submittingForm = false;

    if(error.status=422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else 
      this.serverErrorMessages = 
        ['falha na comunicação com o servidor. Por favor tente novamente mais tarde'];
  }

  protected abstract buildResourceForm(): void;

}
