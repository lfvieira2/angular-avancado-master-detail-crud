import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';
import { NullInjector } from '@angular/core/src/di/injector';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currenctAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  };

  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  }

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;

    if(this.currenctAction == 'new')
      this.createEntry();
    else 
      this.updateEntry();
  }

  // private methods

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path == 'new')
      this.currenctAction = 'new';
    else
      this.currenctAction = 'edit';
  }

  private buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]]


    })
  }

  private loadEntry() {
    if (this.currenctAction == 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get('id')))
      )
        .subscribe(
          (entry) => {
            this.entry = entry;
            this.entryForm.patchValue(entry); // binds loaded entry data to entryForm
          },
          (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
        )
    }
  }

  private setPageTitle() {
    if (this.currenctAction == 'new')
      this.pageTitle = 'Cadastro de novo Lançamento';
    else {
      const entryName = this.entry.name || '';
      this.pageTitle = 'Editando Lançamento: ' + entryName;
    }

  }

  private createEntry(){
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry)
    .subscribe(
      entry => this.actionsForSuccess(entry),
      error => this.actionsForError(error)
    )
  }

  private updateEntry(){
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.update(entry)
    .subscribe(
      entry => this.actionsForSuccess(entry),
      error => this.actionsForError(error)
    )
  }

  private actionsForSuccess(entry: Entry){
    toastr.success('Solicitação processada com sucesso!');

    // redirect/reload component page
    this.router.navigateByUrl('entries', {skipLocationChange: true}).then(
      () => this.router.navigate(['entries', entry.id, 'edit'])
    )
  }

  private actionsForError(error){
    toastr.error('Ocorreu um erro ao processar sua solicitação!');

    this.submittingForm = false;

    if(error.status=422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else 
      this.serverErrorMessages = 
        ['falha na comunicação com o servidor. Por favor tente novamente mais tarde'];
  }

}
