import libros from '../models/libros.json'

module.exports.getLibros = (req, res) => {
    if(libros){
        res.status(200).json({data:libros, msg:"Libros Encontrado"})
    }else{
        res.status(404).json({msg:"no se encontraron los libros"})
    }
}