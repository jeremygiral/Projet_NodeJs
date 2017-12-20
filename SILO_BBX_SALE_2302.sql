/*==============================================================*/
/* Nom de SGBD :  MySQL 4.0                                     */
/* Date de création :  20/12/2017 17:06:57                      */
/*==============================================================*/


drop index FK_FACT2_FK on FK_FACT;

drop index FK_FACT_FK on FK_FACT;

drop index FK_LIV2_FK on FK_LIV;

drop index FK_LIV_FK on FK_LIV;

drop index FK_GROUP_USER_FK on USER;

drop table if exists ADRESSE;

drop table if exists FK_FACT;

drop table if exists FK_LIV;

drop table if exists "GROUP";

drop table if exists USER;

/*==============================================================*/
/* Table : ADRESSE                                              */
/*==============================================================*/
create table ADRESSE
(
   ID_ADRESSE                     int                            not null,
   CD_CODE_POSTAL                 text,
   LB_VILLE                       text,
   LB_PAYS                        text,
   LB_REGION                      text,
   LB_RUE                         text,
   NUM_RUE                        text,
   MT_LONGITUDE                   decimal,
   MT_LATITUDE                    decimal,
   primary key (ID_ADRESSE)
)
type = InnoDB;

/*==============================================================*/
/* Table : FK_FACT                                              */
/*==============================================================*/
create table FK_FACT
(
   ID_USER                        int                            not null,
   ID_ADRESSE                     int                            not null,
   primary key (ID_USER, ID_ADRESSE)
)
type = InnoDB;

/*==============================================================*/
/* Index : FK_FACT_FK                                           */
/*==============================================================*/
create index FK_FACT_FK on FK_FACT
(
   ID_USER
);

/*==============================================================*/
/* Index : FK_FACT2_FK                                          */
/*==============================================================*/
create index FK_FACT2_FK on FK_FACT
(
   ID_ADRESSE
);

/*==============================================================*/
/* Table : FK_LIV                                               */
/*==============================================================*/
create table FK_LIV
(
   ID_USER                        int                            not null,
   ID_ADRESSE                     int                            not null,
   primary key (ID_USER, ID_ADRESSE)
)
type = InnoDB;

/*==============================================================*/
/* Index : FK_LIV_FK                                            */
/*==============================================================*/
create index FK_LIV_FK on FK_LIV
(
   ID_USER
);

/*==============================================================*/
/* Index : FK_LIV2_FK                                           */
/*==============================================================*/
create index FK_LIV2_FK on FK_LIV
(
   ID_ADRESSE
);

/*==============================================================*/
/* Table : "GROUP"                                              */
/*==============================================================*/
create table "GROUP"
(
   ID_GROUP                       int                            not null,
   LB_NOM                         text,
   LB_DESC                        text,
   primary key (ID_GROUP)
)
type = InnoDB;

/*==============================================================*/
/* Table : USER                                                 */
/*==============================================================*/
create table USER
(
   ID_USER                        int                            not null,
   ID_GROUP                       int,
   FK_ADRESSE_LIV                 int                            not null,
   FK_ADRESSE_FACT                int                            not null,
   FK_GROUP                       int                            not null,
   LB_NAME                        text,
   DT_NAISSANCE                   date,
   LOGIN                          text,
   PASSWORD                       text,
   primary key (ID_USER)
)
type = InnoDB;

/*==============================================================*/
/* Index : FK_GROUP_USER_FK                                     */
/*==============================================================*/
create index FK_GROUP_USER_FK on USER
(
   ID_GROUP
);

alter table FK_FACT add constraint FK_FK_FACT foreign key (ID_USER)
      references USER (ID_USER) on delete restrict on update restrict;

alter table FK_FACT add constraint FK_FK_FACT2 foreign key (ID_ADRESSE)
      references ADRESSE (ID_ADRESSE) on delete restrict on update restrict;

alter table FK_LIV add constraint FK_FK_LIV foreign key (ID_USER)
      references USER (ID_USER) on delete restrict on update restrict;

alter table FK_LIV add constraint FK_FK_LIV2 foreign key (ID_ADRESSE)
      references ADRESSE (ID_ADRESSE) on delete restrict on update restrict;

alter table USER add constraint FK_FK_GROUP_USER foreign key (ID_GROUP)
      references "GROUP" (ID_GROUP) on delete restrict on update restrict;

