JazelKit
========

   [!NOTE] Deutsche Dokumentation: `Hier klicken <./README.de.md>`__

Table of Contents
-----------------

- `JazelKit <#jazelkit>`__

  - `Table of Contents <#table-of-contents>`__
  - `Install <#install>`__

    - `Clone and Build for install <#clone-and-build-for-install>`__
    - `Use in your project <#use-in-your-project>`__

  - `Contributing <#contributing>`__

Install
-------

Clone and Build for install
~~~~~~~~~~~~~~~~~~~~~~~~~~~

To install JazelKit, do the following in the directory where you want to
install it:

.. code:: sh

   git clone https://github.com/Fren507/JazelKit.git

After cloning, do these steps:

.. code:: sh

   cd JazelKit
   npm i
   npm run build
   npm link

..

   [!TIP] If ``npm link`` isn’t working and you’re on an Unix-like
   system (MacOS, Linux), try it again with ``sudo``:

   .. code:: sh

      sudo npm link

   If you’re on Windows, I do not know… Tja ;)

Use in your project
~~~~~~~~~~~~~~~~~~~

To use JazelKit inside an project, run the following to install it:

.. code:: sh

   npm link jazelkit

| Now you can import JazelKit!
| Because JazelKit is still in alpha stage, you have to create files
  manually! But you won’t have to, because you can clone the example
  template:

.. code:: sh

   git clone https://github.com/Fren507/JazelKit-Template.git path/to/project
   cd path/to/project
   npm i
   npm link jazelkit
   npm run dev

Contributing
------------

If you want to contribute to JazelKit, check out
`CONTRIBUTING.md <./CONTRIBUTING.md>`__ and create a Pull Request!
