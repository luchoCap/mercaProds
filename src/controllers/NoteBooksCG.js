import Peelr from 'peelr'


module.exports.getNotebooksCg = async (req, res) => {
    const peelr = await Peelr.hash(
      'li.products__item',
        {
          name: Peelr.text('h4.products__name > a', { transform: cad => cad.substr(61) }),
          price: Peelr.text('span.products__price-new font', { transform: cad => cad.substr(3) }),
          link:Peelr.attr('h4.products__name > a', 'href'),
          img:Peelr.attr('a.products__foto > img','data-src')
        },
        {multiple:true}
      ).extract({
        url: "https://compragamer.com/index.php?seccion=3&cate=58&nro_max=50",
        headers: {
          'Accept': 'text/html'
        }
      }
        );
        console.log(peelr)
        if (peelr) {
            return res.status(200).json(peelr)
        } else
            return res.status(400).json({ msg: "Error" })
    }