const htmlTag = require('html-tag');
const render = require('datocms-structured-text-to-html-string');

// This function helps transforming structures like:
//
// [{ tagName: 'meta', attributes: { name: 'description', content: 'foobar' } }]
//
// into proper HTML tags:
//
// <meta name="description" content="foobar" />

const toHtml = (tags) => {
  if (tags) {
    return tags.map(({ tagName, attributes, content }) => (
      htmlTag(tagName, attributes, content)
    )).join("")
  } else {
    return ""
  }
};

// Arguments that will receive the mapping function:
//
// * dato: lets you easily access any content stored in your DatoCMS
//   administrative area;
//
// * root: represents the root of your project, and exposes commands to
//   easily create local files/directories;
//
// * i18n: allows to switch the current locale to get back content in
//   alternative locales from the first argument.
//
// Read all the details here:
// https://github.com/datocms/js-datocms-client/blob/master/docs/dato-cli.md

module.exports = (dato, root, i18n) => {

  var pages = [ 'home', 'pageAbout', 'pageTopic', 'pageCompany', 'pageContact'];

  // Add to the existing Hugo config files some properties coming from data
  // stored on DatoCMS
  ['config.dev.toml', 'config.prod.toml'].forEach(file => {
    root.addToDataFile(file, 'toml', {
      title: dato.site.globalSeo.siteName,
      languageCode: i18n.locale,
      menu: {
        main: pages.map((page, index) => {
          return {
            identifier: page,
            name: dato[page].title,
            url: '/' + dato[page].slug,
            weight: (index+1) * 100
          }
        })
      }
    });
  });





  /*
  // Create a YAML data file to store global data about the site
  root.createDataFile('data/settings.yml', 'yaml', {
    name: dato.site.globalSeo.siteName,
    language: dato.site.locales[0],
    intro: dato.home.introText,
    copyright: dato.home.copyright,
    // iterate over all the `social_profile` item types
    socialProfiles: dato.socialProfiles.map(profile => {
      return {
        type: profile.profileType.toLowerCase().replace(/ +/, '-'),
        url: profile.url,
      };
    }),
    faviconMetaTags: toHtml(dato.site.faviconMetaTags),
    seoMetaTags: toHtml(dato.home.seoMetaTags)
  });
*/

  var siteData = dato.site.toMap()

 

  // TODO abstract path 



  
  pages.forEach((page, index) => {
      if (dato[page]) {
        var pageData = dato[page];
        var filename = (page == "home" ? 'index.md' : pageData.slug + '/index.md');

        var frontmatter ={
          type: pageData.slug == '' ? 'home' : pageData.slug,
          title: pageData.title,
          url: '/' + dato[page].slug,
          seoMetaTags: toHtml(pageData.seoMetaTags)
        }

        addBanner(frontmatter, pageData);
        addDomains(frontmatter, pageData);
        addCompanies(frontmatter, pageData)
        addThemes(frontmatter, pageData)
        addContact(frontmatter, pageData)



        root.createPost('content/' + filename, 'yaml', {
          frontmatter: frontmatter
        });
        
        


      }
  });

  
function addBanner(frontmatter, pageData) {
  if (pageData && pageData.header && pageData.header.length > 0  ) {
    var headerData = pageData.header[0];
    frontmatter.banner = {
      title: headerData.title,
      short: headerData.short,
      link: headerData.link,
      dark: headerData.dark,
      image: headerData.image
    }
  }
}  

function addDomains(frontmatter, pageData) {
  if(pageData.domainsTitle) {
    frontmatter.domains = {
      title: pageData.domainsTitle,
      items: pageData.domains.map((item, index) => { return {
        title: item.title,
        short: item.short,
        icon: item.icon,
        weight: index,
        even: (index % 2 == 0)
      }})
    }    
  }
}

function addCompanies(frontmatter, pageData) {
  if (pageData.companiesTitle) {
    frontmatter.companies = {
      title:pageData.companiesTitle,
      short:pageData.companiesShort,
      items: pageData.companies.map((item, index) => {
        return {
          name: item.name,
          short: item.short,
          long: item.long,
          url_website: item.url_website,
          url_jobs: item.url_jobs,
          url_cases: item.url_cases,
          weight: index,
          even: (index % 2 == 0)
        }
      })
    }
  }
}

function addThemes(frontmatter, pageData) {
  if(pageData.themesTitle) {
    frontmatter.themes = {
      title: pageData.themesTitle,
      items: pageData.themes.map((item, index) => { return {
        title: item.title,
        short: item.short,
        icon: item.icon,
        image: item.image,
        weight: index,
        even: (index % 2 == 0)
      }})
    }    
  }
}
// TODO render dast
function addContact(frontmatter, pageData) {
  if (pageData && pageData.contact && pageData.contact.length > 0) {
    var contactData = pageData.contact[0];
    console.log(contactData.short)
    console.dir(contactData.short)
    frontmatter.contact = {
      title: contactData.title,
      short: render.render(contactData.short),
    }
  }
}  





  // root.createPost('content/home/service.' + '.md', 'yaml', {

  // })



  /*
    // Create a markdown file with content coming from the `about_page` item
    // type stored in DatoCMS
    root.createPost(`content/about.md`, 'yaml', {
      frontmatter: {
        title: dato.aboutPage.title,
        subtitle: dato.aboutPage.subtitle,
        photo: dato.aboutPage.photo.url({ w: 800, fm: 'jpg', auto: 'compress' }),
        seoMetaTags: toHtml(dato.aboutPage.seoMetaTags),
        menu: { main: { weight: 100 } }
      },
      content: dato.aboutPage.bio
    });
    */
  /*
    // Create a `work` directory (or empty it if already exists)...
    root.directory('content/works', dir => {
      // ...and for each of the works stored online...
      dato.works.forEach((work, index) => {
        // ...create a markdown file with all the metadata in the frontmatter
        dir.createPost(`${work.slug}.md`, 'yaml', {
          frontmatter: {
            title: work.title,
            coverImage: work.coverImage.url({ w: 450, fm: 'jpg', auto: 'compress' }),
            image: work.coverImage.url({ fm: 'jpg', auto: 'compress' }),
            detailImage: work.coverImage.url({ w: 600, fm: 'jpg', auto: 'compress' }),
            excerpt: work.excerpt,
            seoMetaTags: toHtml(work.seoMetaTags),
            extraImages: work.gallery.map(item =>
              item.url({ h: 300, fm: 'jpg', auto: 'compress' })
            ),
            weight: index
          },
          content: work.description
        });
      });
    });
  */
};


