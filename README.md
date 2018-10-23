# My Jekyll Blog

## Description

My personal blog

[http://chasefranks.github.io](http://chasefranks.github.io)

built with [Jekyll](https://jekyllrb.com), and uses [Bootstrap](http://getbootstrap.com/) for the look and feel.

## Getting Started

Feel free to clone this repo to try out Jekyll and see a working example, or fork it to start your own blog.

To get up and running with Jekyll, follow the instructions here [installing Jekyll](https://jekyllrb.com/docs/installation/). You will also need a Ruby gem called Bundler

```bash
gem install bundler
```

After installing Jekyll and Bundler, getting this site built and running on a local test server is as easy as running

```bash
cd chasefranks.github.io
bundle install
bundle exec jekyll build
bundle exec jekyll serve
```

`bundle install` - uses the Ruby gem [*bundler*](http://bundler.io/rationale.html) to install the dependencies listed in Gemfile.

`jekyll build` - builds the site

`jekyll serve` - launches a web server to preview your changes locally. You should be able to see your site by launching a browser and going to http://localhost:4000.

**Note:** these commands are executed with through `bundle exec` to manage Ruby dependencies through the Gemfile.

### Adding Posts

Adding blog posts is simple. In the `_posts` folder, you will see the posts I have created. Just copy the yyyy-mm-dd-new-post.md, change the date to the post date, set `published: true`, add your content, and voila! the post should magically appear.

## Contact

If there are any issues with this repo or you have any questions, feel free to reach out.

[clf112358@gmail.com](mailto:clf112358@gmail.com)

I'm still learning about Jekyll as I go, so I'll try my best to answer.
