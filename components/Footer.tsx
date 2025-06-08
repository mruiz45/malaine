const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 body-font">
      <div className="container px-5 py-8 mx-auto text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Malaine — votre assistant tricot/crochet
        </p>
      </div>
    </footer>
  );
};

export default Footer; 