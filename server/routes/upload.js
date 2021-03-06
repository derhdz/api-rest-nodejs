const express =  require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

app.use(fileUpload());

app.put('/upload/:tipo/:id',(req,res)=>{

    let tipo = req.params.tipo;
    let id = req.params.id;



    if(!req.files){
        return res.status(400).json({
            ok:false,
            err:{
                message:'No se ha seleccionado ningun archivo'
            }
        });
    }

    //validar tipo
    let tiposValidos = ['productos','usuarios'];
    if(tiposValidos.indexOf(tipo)<0){
        return res.status(400).json({
            ok:false,
            err:{
                message:'Los tipos permitidos  son: '+ tiposValidos.join(', ')
            }
        })
    }



    let archivo = req.files.archivo;
        let nombreCortado = archivo.name.split('.');
        let extension = nombreCortado[nombreCortado.length -1];
    //extensiones permitidas
    let extensionesValidas =['png','jgp','gif','jpeg'];
    if(extensionesValidas.indexOf(extension)<0){
        return res.status(400).json({
            ok:false,
            err:{
                message:'Las extensiones permitidas son :'+extensionesValidas.join(', '),
                ext:extension
            }
        })
    }
        //cambiar nombre al archivo
        let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`,(err)=>{
        if(err){ return res.status(500).json({
                                        ok:false,
                                        err
                                    })
        }
        if(tipo==="usuarios"){
            imagenUsuario(id,res,nombreArchivo);
        }else{
            imagenProducto(id,res,nombreArchivo);
        }
        

       
    })
  


});

function imagenUsuario(id,res,nombreArchivo){
    Usuario.findById(id,(err,UsuarioDB)=>{
        if(err){
            borraArchivo(nombreArchivo,'usuarios')
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if(!UsuarioDB){
            borraArchivo(nombreArchivo,'usuarios')
            return res.status(400).json({
                ok:false,
                err:{
                    message:'Usuario no existe'
                }
            })
        }

        borraArchivo(UsuarioDB.img,'usuarios')

        UsuarioDB.img = nombreArchivo;
        UsuarioDB.save((err,usuarioGuardado)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                })
            }
            res.json({
                ok:true,
                Usuario:usuarioGuardado,
                img:nombreArchivo
            })
        })


    })
}

function imagenProducto(id,res,nombreArchivo){

    Producto.findById(id,(err,ProductoDB)=>{
        if(err){
            borraArchivo(nombreArchivo,'productos')
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if(!ProductoDB){
            borraArchivo(nombreArchivo,'productos')
            return res.status(400).json({
                ok:false,
                err:{
                    message:'Producto no existe'
                }
            })
        }

        borraArchivo(ProductoDB.img,'productos')

        ProductoDB.img = nombreArchivo;
        ProductoDB.save((err,productoGuardado)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                })
            }
            res.json({
                ok:true,
                Producto:productoGuardado,
                img:nombreArchivo
            })
        })


    })


}

function borraArchivo(nombreImagen,tipo){
    let pathImagen =path.resolve(__dirname,`../../uploads/${tipo}/${nombreImagen}`);

        if(fs.existsSync(pathImagen)){
            fs.unlinkSync(pathImagen);
        }
}

module.exports = app;