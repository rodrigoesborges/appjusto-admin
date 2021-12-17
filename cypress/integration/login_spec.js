describe('Login', () => {
  it('User can login', () => {
    // command
    cy.userLogin();
    cy.wait(6000);
    // assert
    // iser in onboarding or in home page
    cy.findAllByText(/início|começar/i).should('be.visible');
  });
});
