import {Request,Response} from "express";

import {Category, ICategory} from "../models/category.model";
import {LanguageService} from "../services/language.service";

import { MongooseDocument } from "mongoose";
import { Language, ILanguage } from "../models/language.model";


class CategoryHelpers{

    GetCategory(filter: any):Promise<ICategory>{        
        return new Promise<ICategory>( (resolve) => {
            Category.find(filter,(err:Error,category:ICategory)=>{
                if(err){
                    console.log(err);
                }else{
                    resolve(category);
                }
            }); 
        });
    }
}


class LenguageHelpers{

    GetLanguage(filter: any):Promise<ILanguage>{        
        return new Promise<ILanguage>( (resolve) => {
            Language.find(filter,(err:Error,language:ILanguage)=>{
                if(err){
                    console.log(err);
                }else{
                    resolve(language);
                }
            }); 
        });
    }
}

export class CategoryService extends CategoryHelpers{

    public getAll(req:Request, res:Response){
        Category.find({},(err:Error, categories: MongooseDocument)=>{
            if(err){
                res.status(401).send(err);
            }else{
                res.status(200).json(categories);
            }
            
        });
    }

    public getAllWLanguage(req:Request, res:Response){

        Category.aggregate([{
            "$lookup":{
                from: "languages",
                localField:"_id",
                foreignField:"category",
                as: "l"
            },  
           
        }],(err:Error,data:any)=>{
            if(err){
                res.status(401).send(err);
            }else{
                res.status(200).json(data);
            }
        })

    }

    //probando esta clase talves funciona :c


   public getAllLanguagesToCategory(req:Request, res:Response){
       Language.find({},(err:Error, languages: MongooseDocument)=>{
            if(err){
               res.status(401).send(err);
           }else{
                res.status(200).json(languages);
           }
            
        });
    }



   //Probando agregar un nuevo servidor o una nueva funcion para poder agregar en el servidor un endpoint en donde pueda concatenar a los lenguajes que estan
   //dentro de una misma categoria xD

    public getAllLangbyCat(req:Request, res:Response){

        Language.aggregate([{
            "$lookup":{
                from: "Languages",
                localField:"_id",
                foreignField:"category",
                as: "l"
            },  
            "$match": {
                _id:" ",
            category: ""
               },
            "$project":{
              _id: 1,
                name:1,
             description:1,
            category: "$l.category"
           }, 
           //   "$match": {
              // _id:"5ebf7da462158c0f4c8f255a","5ec0325b9bd4ca23dc8a5f70","5ec0ab21febcff23f40f625e",
                


          // }
        

        }],(err:Error,data:any)=>{
            if(err){
                res.status(401).send(err);
            }else{
                res.status(200).json(data);
            }
        })

    }


    public async NewOne(req: Request, res: Response){        
        const c = new Category(req.body);
        const old_cat:any = await super.GetCategory({name:c.name});

        if( old_cat.length === 0 ){
            await c.save((err:Error, category: ICategory)=>{
                if(err){
                    res.status(401).send(err);
                }else{
                    res.status(200).json( category? {successed:true, category: category } : {successed:false} );
                }            
            });
        }else{
            res.status(200).json({successed:false});
        }        

    }
    

    public async deleteOne(req: Request, res: Response){
        const language_service: LanguageService = new LanguageService();
        const languages:any = await language_service.GetLanguage({category: req.params.id});

        if( languages.length > 0 ){
            res.status(200).json({successed:false});
        }else{

            Category.findByIdAndDelete(req.params.id,(err:Error)=>{
                if(err){
                    res.status(401).send({successed:false});
                }else{
                    res.status(200).json({successed:true});
                }
            });

        }

    }
    
    //buscando redirigir el boton con una funcion , hay que probarla al final......
    
    
   // public async RedirigirOne(req: Request, res: Response){
   //     const language_service: LanguageService = new LanguageService();
   //     const languages:any = await language_service.GetLanguage({category: req.params.id});

   //     if( languages.length > 0 ){
   //         res.status(200).json({successed:false});
  //      }else{

   //         Category.findByIdAndDelete(req.params.id,(err:Error)=>{
   //             if(err){
   //                 res.status(401).send({successed:false});
   //             }else{
   //                 res.status(200).json({successed:true});
   //             }
   //         });

   //     }

  //  }

}
