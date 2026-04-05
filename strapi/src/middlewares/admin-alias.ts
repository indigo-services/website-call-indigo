export default () => {
  return async (ctx, next) => {
    const aliasBase = '/build/superadmin';
    const canonicalBase = '/manage/admin';

    if (ctx.path === aliasBase || ctx.path.startsWith(`${aliasBase}/`)) {
      const suffix = ctx.path.slice(aliasBase.length);
      const query = ctx.querystring ? `?${ctx.querystring}` : '';
      ctx.status = 302;
      ctx.redirect(`${canonicalBase}${suffix}${query}`);
      return;
    }

    await next();
  };
};
