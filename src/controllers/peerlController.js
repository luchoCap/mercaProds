import Peelr from 'peelr'


module.exports.getPeelr = async (req, res) => {
    const peelr = await Peelr.hash(
      'li.products__item',
        {
          name: Peelr.text('h4.products__name > a', { transform: cad => cad.substr(61) }),
          price: Peelr.text('span.products__price-new font'),
          link:Peelr.attr('h4.products__name > a', 'href'),
          img:Peelr.attr('a.products__foto > img','data-src')
        },
        {multiple:true}
      ).extract({
        url: "https://compragamer.com/index.php?seccion=3&destacados=1&nro_max=200",
        headers: {
          'Accept': 'text/html'
        }
      }
        );

  //  const peelr = await Peelr.hash(
  //     'article.fhitem-story',
  //     {
  //       title: Peelr.text('.story-title > a'),
  //       link: Peelr.attr('.story-title > a', 'href'),
  //       comments: Peelr.text('.comment-bubble a', { transform: n => Number(n) }),
  //       time: Peelr.attr('.story-byline time', 'datetime'),
  //       source: Peelr.attr('.story-sourcelnk', 'href'),
  //       related: Peelr.link(
  //         '.story-title > a',
  //         Peelr.attr('#newa2footerv2 .c h3 a', 'href', { multiple: true })
  //       )
  //     },
  //     { multiple: true }
    // ).extract('https://slashdot.org');
      console.log(peelr)
    if (peelr) {
        return res.status(200).json(peelr)
    } else
        return res.status(400).json({ msg: "Error" })
}